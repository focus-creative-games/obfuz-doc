# 单独执行混淆

有时会需要在构造流程之外执行混淆。例如使用HybridCLR热更新后，希望发布热更新代码前对热更新代码执行混淆。

:::warning
如果你正在使用HybridCLR，强烈使用`com.cod-philosphy.obfuz4hybridclr` package，因为它已经提供所有HybridCLR热更新需要的代码，使用更方便简单。
详细文档见[与HybridCLR协同工作](./hybridclr/work-with-hybridclr)。
:::

## 生成需要被混淆的dll

源码形式的程序集需要先编译为dll才能被Obfuz混淆。对于Unity工程内的源码，可以使用以下代码实现编译dll：

```csharp

public class ObfusacteTool
{
  public static void CompileDll(string buildDir, BuildTarget target, bool developmentBuild)
  {
    var group = BuildPipeline.GetBuildTargetGroup(target);

    ScriptCompilationSettings scriptCompilationSettings = new ScriptCompilationSettings();
    scriptCompilationSettings.group = group;
    scriptCompilationSettings.target = target;
    scriptCompilationSettings.options = developmentBuild ? ScriptCompilationOptions.DevelopmentBuild : ScriptCompilationOptions.None;
    Directory.CreateDirectory(buildDir);
    ScriptCompilationResult scriptCompilationResult = PlayerBuildInterface.CompilePlayerScripts(scriptCompilationSettings, buildDir);
#if UNITY_2022
    UnityEditor.EditorUtility.ClearProgressBar();
#endif
    Debug.Log($"compile finish!!! buildDir:{buildDir} target:{target} development:{developmentBuild}");
  }
}
```

## 代码实现

:::tip

单独执行混淆不会触发`Obfuz.Unity.ObfuscationBeginEventArgs`和`Obfuz.Unity.ObfuscationEndEventArgs`，这两个事件只在构建流程中才会被触发。

:::

混淆前请先编译好dll。

```csharp

using HybridCLR.Editor;
using Obfuz.Settings;
using Obfuz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UnityEditor;
using HybridCLR.Editor.Commands;
using HybridCLR.Editor.Installer;
using System.IO;
using HybridCLR.Editor.ABI;
using UnityEngine;


public static class ObfuscateUtil
{

    public static void Obfuscate(BuildTarget target, List<string> assemblySearchPaths, string outputPath)
    {
        var obfuzSettings = ObfuzSettings.Instance;

        var assemblySearchDirs = assemblySearchPaths;

        // 默认的dll搜索路径不会包含UnityEditor相关程序集。
        // 如果被混淆的程序集只在Editor下使用，它引用了UnityEditor相关程序集，
        // 则需要 searchPathIncludeUnityEditorDll=true
        bool searchPathIncludeUnityEditorDll = false;
        ObfuscatorBuilder builder = ObfuscatorBuilder.FromObfuzSettings(obfuzSettings, target, true, searchPathIncludeUnityEditorDll);
        builder.InsertTopPriorityAssemblySearchPaths(assemblySearchDirs);

        string obfuscatedAssemblyOutputPath = obfuzSettings.GetObfuscatedAssemblyOutputPath(target);

        Obfuscator obfuz = builder.Build();
        obfuz.Run();

        Directory.CreateDirectory(outputPath);
        foreach (string srcFile in Directory.GetFiles(obfuscatedAssemblyOutputPath, "*.dll"))
        {
            string fileName = Path.GetFileName(srcFile);
            string destFile = $"{outputPath}/{fileName}";
            File.Copy(srcFile, destFile, true);
            Debug.Log($"Copy {srcFile} to {destFile}");
        }
    }
}


```
