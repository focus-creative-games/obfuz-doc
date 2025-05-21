# 单独执行混淆

有时会需要在构造流程之外执行混淆。例如使用HybridCLR热更新后，希望发布热更新代码前对热更新代码执行混淆。

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
    public static bool AreSameDirectory(string path1, string path2)
    {
        try
        {
            var dir1 = new DirectoryInfo(path1);
            var dir2 = new DirectoryInfo(path2);

            // 比较完整路径（考虑符号链接）
            return dir1.FullName.TrimEnd('\\') == dir2.FullName.TrimEnd('\\');
        }
        catch
        {
            return false;
        }
    }

    public static void Obfuscate(BuildTarget target, List<string> assemblySearchPaths, string outputPath)
    {
        var obfuzSettings = ObfuzSettings.Instance;

        var assemblySearchDirs = assemblySearchPaths;
        ObfuscatorBuilder builder = ObfuscatorBuilder.FromObfuzSettings(obfuzSettings, target, true);
        builder.InsertTopPriorityAssemblySearchPaths(assemblySearchDirs);

        string obfuscatedAssemblyOutputPath = obfuzSettings.GetObfuscatedAssemblyOutputPath(target);
        if (AreSameDirectory(outputPath, obfuscatedAssemblyOutputPath))
        {
            throw new Exception($"outputPath:{outputPath} can't be same to ObfuscatedAssemblyOutputPath:{obfuscatedAssemblyOutputPath}");
        }
        foreach (var assemblySearchDir in builder.AssemblySearchPaths)
        {
            if (AreSameDirectory(assemblySearchDir, obfuscatedAssemblyOutputPath))
            {
                throw new Exception($"assemblySearchDir:{assemblySearchDir} can't be same to ObfuscatedAssemblyOutputPath:{obfuscatedAssemblyOutputPath}");
            }
        }

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

Obfuscator执行过程不会触发`Obfuz.Unity.ObfuscationBeginEventArgs`和`Obfuz.Unity.ObfuscationEndEventArgs`，因为没什么必要。
