# 与HybridCLR协同工作

本工程演示如何将Obfuz与HybridCLR一起使用，完整示例项目参见[WorkWithHybridCLR](https://github.com/focus-creative-games/obfuz/tree/main/Samples/WorkWithHybridCLR)。

## 安装

按照Obfuz和HybridCLR的安装文档操作即可。

:::warning

Obfuz和HybridCLR插件都包含了dnlib插件。对于Unity 2021及更早版本，当两个package中包含同名插件时会产生错误。
解决办法为将这两个插件之一（不必两个都改为本地安装）改为本地安装，即将Obfuz或HybridCLR下载到本地，移除其中包含的dnlib.dll，再放到Packages目录下。

:::

## 创建代码

- 创建HotUpdate程序集，并在程序集内创建一个类型Entry
- Assets目录下创建`Bootstrap.cs`类

详细代码内容见示例项目。

## 配置

- 将HotUpdate加入`HybridCLRSettings`的热更新程序集列表
- 将HotUpdate和Assembly-CSharp加入`ObfuzSettings.AssembliesToObfuscate`列表

## 解决HybridCLR的一些问题

HybridCLR的`HybridCLR/Generate/All`及`HybridCLR/Generate/LinkXml`都是基于未混淆的代码生成的link.xml，这导致混淆后生成的link.xml关于混淆程序集相关的预留完全
没有生效，因为对应的名字在混淆后的程序集中并不存在。

解决办法为为混淆后的程序集额外生成一个link.xml，代码如下：

```csharp

    [MenuItem("Obfuz/GenerateLinkXmlForHybridCLR")]
    public static void GenerateLinkXml()
    {
        CompileDllCommand.CompileDllActiveBuildTarget();
        BuildTarget target = EditorUserBuildSettings.activeBuildTarget;
        var obfuzSettings = ObfuzSettings.Instance;

        var assemblySearchDirs = new List<string>
        {
            SettingsUtil.GetHotUpdateDllsOutputDirByTarget(target),
        };
        ObfuscatorBuilder builder = ObfuscatorBuilder.FromObfuzSettings(obfuzSettings, target, true);
        builder.InsertTopPriorityAssemblySearchPaths(assemblySearchDirs);

        Obfuscator obfuz = builder.Build();
        obfuz.Run();


        List<string> hotfixAssemblies = SettingsUtil.HotUpdateAssemblyNamesExcludePreserved;

        var analyzer = new Analyzer(new PathAssemblyResolver(builder.ObfuscatedAssemblyOutputPath));
        var refTypes = analyzer.CollectRefs(hotfixAssemblies);

        // HyridCLR中 LinkXmlWritter不是public的，在其他程序集无法访问，只能通过反射操作
        var linkXmlWriter = typeof(SettingsUtil).Assembly.GetType("HybridCLR.Editor.Link.LinkXmlWriter");
        var writeMethod = linkXmlWriter.GetMethod("Write", BindingFlags.Public | BindingFlags.Instance);
        var instance = Activator.CreateInstance(linkXmlWriter);
        string linkXmlOutputPath = $"{Application.dataPath}/Obfuz/link.xml";
        writeMethod.Invoke(instance, new object[] { linkXmlOutputPath, refTypes });
        Debug.Log($"[GenerateLinkXmlForObfuscatedAssembly] output:{linkXmlOutputPath}");
        AssetDatabase.Refresh();
    }

```

## 添加混淆热更新的相关代码

```csharp
    [MenuItem("Obfuz/CompileAndObfuscateAndCopyToStreamingAssets")]
    public static void CompileAndObfuscateAndCopyToStreamingAssets()
    {
        BuildTarget target = EditorUserBuildSettings.activeBuildTarget;
        string outputPath = ObfuzSettings.Instance.GetObfuscatedAssemblyOutputPath(target);
        CompileAndObfuscate(target, outputPath);

        Directory.CreateDirectory(Application.streamingAssetsPath);

        foreach (string assName in SettingsUtil.HotUpdateAssemblyNamesIncludePreserved)
        {
            string srcFile = $"{outputPath}/{assName}.dll";
            string dstFile = $"{Application.streamingAssetsPath}/{assName}.dll.bytes";
            File.Copy(srcFile, dstFile, true);
            Debug.Log($"[CompileAndObfuscate] Copy {srcFile} to {dstFile}");
        }
    }


    public static void CompileAndObfuscate(BuildTarget target, string outputPath)
    {
        CompileDllCommand.CompileDll(EditorUserBuildSettings.activeBuildTarget, EditorUserBuildSettings.development);
        var assemblySearchPaths = new List<string>
      {
        SettingsUtil.GetHotUpdateDllsOutputDirByTarget(target),
      };
        CustomObfuscate(target, assemblySearchPaths, outputPath);
    }

    public static void CustomObfuscate(BuildTarget target, List<string> assemblySearchPaths, string outputPath)
    {
        var obfuzSettings = ObfuzSettings.Instance;

        var assemblySearchDirs = assemblySearchPaths;
        ObfuscatorBuilder builder = ObfuscatorBuilder.FromObfuzSettings(obfuzSettings, target, true);
        builder.InsertTopPriorityAssemblySearchPaths(assemblySearchDirs);
        builder.ObfuscatedAssemblyOutputPath = outputPath;

        Obfuscator obfuz = builder.Build();
        obfuz.Run();
    }

```

## 生成加密虚拟机及密钥

- 运行菜单`Obfuz/GenerateEncryptionVM`生成加密虚拟机代码，默认生成的代码文件为`Assets/Obfuz/GeneratedEncryptionVirtualMachine.cs`。
- 运行菜单`Obfuz/GenerateSecretKeyFile`生成两个密钥文件。默认输出文件为`Assets/Resources/Obfuz/defaultStaticSecretKey.bytes`和`Assets/Resources/Obfuz/defaultDynamicSecretKey.bytes`

## 生成HybridCLR相关的代码

- 运行`Obfuz/GenerateLinkXmlForHybridCLR`
- 运行`HybridCLR/Generate/All`

## 生成混淆后的热更新程序集并且放到StreamingAssets目录下

- 运行`Obfuz/CompileAndObfuscateAndCopyToStreamingAssets`

## 打包&运行

在`Build Settings`中运行`Build And Run`构建并且运行，查看player.log验证其确实正确运行。

## 查看混淆后的HotUpdate程序集

打开上一步`打包&运行`的输出目录，使用[ILSpy](https://github.com/icsharpcode/ILSpy)打开`ObfuzDemo_Data\StreamingAssets\HotUpdate.dll.bytes`
查看混淆后的程序集。

Entry类被混淆后的代码如下：

```csharp
using Obfuz;
using UnityEngine;

public class Entry : MonoBehaviour
{
 private void Start()
 {
  $c.$a((object)$B.$a, EncryptionService<DefaultStaticEncryptionScope>.Decrypt(1718597184, 154, 2114032877));
 }

 private void Update()
 {
 }
}

```
