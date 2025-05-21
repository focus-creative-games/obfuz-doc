# 与HybridCLR协同工作

本工程演示如何将Obfuz与HybridCLR一起使用，完整示例项目参见[WorkWithHybridCLR](https://github.com/focus-creative-games/obfuz/tree/main/Samples/WorkWithHybridCLR)。

## 安装

安装以下插件：

- com.code-philosophy.hybridclr `https://github.com/focus-creative-games/hybridclr_unity.git`
- com.code-philosophy.obfuz `https://github.com/focus-creative-games/obfuz.git?path=com.code-philosophy.obfuz`
- com.code-philosophy.obfuz4hybridclr `https://github.com/focus-creative-games/obfuz.git?path=com.code-philosophy.obfuz4hybridclr`

obufz4hybridclr是一个Obfuz扩展包，用于支持HybridCLR热更新工作流。

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

## 添加混淆热更新代码的构建代码

```csharp

using HybridCLR.Editor;
using Obfuz4HybridCLR;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEngine;

public static class BuildCommand
{
    [MenuItem("Build/CompileAndObfuscateAndCopyToStreamingAssets")]
    public static void CompileAndObfuscateAndCopyToStreamingAssets()
    {
        BuildTarget target = EditorUserBuildSettings.activeBuildTarget;
        ObfuscateUtil.CompileAndObfuscateHotUpdateAssemblies(target);

        Directory.CreateDirectory(Application.streamingAssetsPath);

        string hotUpdateDllPath = $"{SettingsUtil.GetHotUpdateDllsOutputDirByTarget(target)}";
        foreach (string assName in SettingsUtil.HotUpdateAssemblyNamesIncludePreserved)
        {
            string srcFile = $"{hotUpdateDllPath}/{assName}.dll";
            string dstFile = $"{Application.streamingAssetsPath}/{assName}.dll.bytes";
            File.Copy(srcFile, dstFile, true);
            Debug.Log($"[CompileAndObfuscate] Copy {srcFile} to {dstFile}");
        }
    }
}

```

## 生成加密虚拟机及密钥

- 运行菜单`Obfuz/GenerateEncryptionVM`生成加密虚拟机代码，默认生成的代码文件为`Assets/Obfuz/GeneratedEncryptionVirtualMachine.cs`。
- 运行菜单`Obfuz/GenerateSecretKeyFile`生成两个密钥文件。默认输出文件为`Assets/Resources/Obfuz/defaultStaticSecretKey.bytes`和`Assets/Resources/Obfuz/defaultDynamicSecretKey.bytes`

## 生成HybridCLR相关的代码

HybridCLR默认的`HybridCLR/Generate/All`命令基于未混淆的程序集生成link.xml。如果有一部分AOT程序集被混淆了，基于未混淆代码生成link.xml中保留的类型和函数都是混淆前的名字，
这导致link.xml无法真正保留那些混淆后的AOT类型和函数。构建后运行热更新代码有可能出现类型和函数被裁剪的情况。

解决办法是使用Obfuz4HybridCLR专门提供的`Obfuz/ObfuzExtension/GenerateAll`命令。

- 运行`Obfuz/ObfuzExtension/GenerateAll`

## 生成混淆后的热更新程序集并且放到StreamingAssets目录下

- 运行`Build/CompileAndObfuscateAndCopyToStreamingAssets`

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
