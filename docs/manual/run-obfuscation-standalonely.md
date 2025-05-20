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

使用HybridCLR插件的开发者，可以运行菜单`HybridCLR/CompileDll/ActiveBuildTarget`编译，或者直接调用 `HybridCLR.Editor.CompileDlllCommand.CompileDll`函数完成代码编译。

## 代码实现

混淆前请先编译好dll。

```csharp

public class ObfusacteTool
{

  public static void CustomObfuscate(BuildTarget target，List<string> assemblySearchPaths, string outputPath)
  {
    var obfuzSettings = ObfuzSettings.Instance;

    var assemblySearchDirs = assemblySearchPaths;
    ObfuscatorBuilder builder = ObfuscatorBuilder.FromObfuzSettings(obfuzSettings, target, true);
    builder.InsertTopPriorityAssemblySearchPaths(assemblySearchDirs);
    builder.ObfuscatedAssemblyOutputPath = outputPath;

    Obfuscator obfuz = builder.Build();
    obfuz.Run();
  }
}

```

对于使用了HybridCLR插件的开发者， assemblySearchPaths可以是热更新程序集的默认输出目录，示例代码如下：

```csharp
public class ObfusacteTool
{
  public static void CompileAndObfuscate(BuildTarget target，string outputPath)
  {
      CompileDllCommand.CompileDll(EditorUserBuildSettings.activeBuildTarget, EditorUserBuildSettings.development);
      var assemblySearchPaths = new List<string>
      {
        SettingsUtil.GetHotUpdateDllsOutputDirByTarget(target),
      };
      CustomObfuscate(target, assemblySearchPaths, outputPath);
  }

  public static void CustomObfuscate(BuildTarget target，List<string> assemblySearchPaths, string outputPath)
  {
      // ...
  }
}

```

Obfuscator执行过程不会触发`Obfuz.Unity.ObfuscationBeginEventArgs`和`Obfuz.Unity.ObfuscationEndEventArgs`，因为没什么必要。
