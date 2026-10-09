# Run Obfuscation Standalone

Sometimes it's necessary to run obfuscation outside of the build pipeline. For example, when using HybridCLR hot updates, you want to obfuscate the hot update code before releasing it.

:::warning
If you are using HybridCLR, strongly recommend using the `com.cod-philosophy.obfuz4hybridclr` package, as it already provides all the code needed for HybridCLR hot updates, making it more convenient and simple to use.
For detailed documentation, see [Working with HybridCLR](./hybridclr/work-with-hybridclr).
:::

## Generate DLLs to be Obfuscated

Source code assemblies need to be compiled into dlls first before they can be obfuscated by Obfuz. For source code within Unity projects, you can use the following code to compile dlls:

```csharp

public class ObfuscateTool
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

## Code Implementation

:::tip

Running obfuscation standalone will not trigger `Obfuz.Unity.ObfuscationBeginEventArgs` and `Obfuz.Unity.ObfuscationEndEventArgs`. These two events are only triggered in the build pipeline.

:::

Please compile the dlls first before obfuscation.

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

        // Default dll search paths do not include UnityEditor related assemblies.
        // If the obfuscated assembly is only used in Editor and references UnityEditor related assemblies,
        // then searchPathIncludeUnityEditorDll=true is needed
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
