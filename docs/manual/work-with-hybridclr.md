# 与HybridCLR协同工作

HybridCLR工作流并未考虑到代码混淆的情况，如果直接使用会遇到一些问题。

## 遇到的问题

### 同时安装Obfuz和HybridCLR后dnlib插件冲突的问题

Obfuz和HybridCLR插件都包含了dnlib插件。对于Unity 2021及更早版本，当两个package中包含同名插件时会产生错误。
解决办法为将这两个插件之一（不必两个都改为本地安装）改为本地安装，即将Obfuz或HybridCLR下载到本地，移除其中包含的dnlib.dll，再放到Packages目录下。

### 被混淆的AOT程序集的裁剪问题

HybridCLR默认的`HybridCLR/Generate/All`命令基于未混淆的程序集生成link.xml。如果有一部分AOT程序集被混淆了，基于未混淆代码生成link.xml中保留的类型和函数都是混淆前的名字，
这导致link.xml无法真正保留那些混淆后的AOT类型和函数。构建后运行热更新代码有可能出现类型和函数被裁剪的情况。

### 如何混淆热更新dll

`HybridCLR/CompileDll/XXX`生成的热更新dll没有被混淆，需要额外对热更新代码进行混淆。

## 解决办法

我们提供com.code-philosophy.obfuz4hybridclr扩展包以解决hybridclr热更新工作流的问题。

用于Unity Package的URL安装地址：

- `https://github.com/focus-creative-games/obfuz4hybridclr.git`
- `https://gitee.com/focus-creative-games/obfuz4hybridclr.git`

## 替换`HybridCLR/Generate/All`

obfuz4hybridclr提供了适合混淆工作流的GenerateAll命令，请在构建过程替换`HybridCLR/Generate/All`命令为`HybridCLR/ObfuzExtension/GenerateAll`。

如果是代码中调用`HybridCLR.Editor.Commands.PrebuildCommand::GenerateAll()`，则替换为`Obfuz4HybridCLR.PrebuildCommandExt.GenerateAll()`。

## 替换`HybridCLR/CompileDll/XXXX`

obfuz4hybridclr提供了同时完成编译和混淆热更新代码的命令，请替换`HybridCLR/Generate/ActiveBuildTarget`为`HybridCLR/Obfuz/Extension/CompileAndObfuscateDll`。

如果是代码中调用`HybridCLR.Editor.Commands.CompileDllCommand.CompileDll`，则替换为`Obfuz4HybridCLR.PrebuildCommandExt.CompileAndObfuscateDll`。
