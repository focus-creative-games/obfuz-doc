# 安装

Obfuz的Unity Package Manager URL安装地址：

- gitee `https://gitee.com/focus-creative-games/obfuz.git?path=com.code-philosophy.obfuz`
- github `https://github.com/focus-creative-games/obfuz.git?path=com.code-philosophy.obfuz`

打开Unity Package Manager窗口，点击`Add package from URL...`，填入以上地址之一即可完成安装。

如果想安装指定版本的Obfuz，可以在URL后添加`#{version}`，如`https://gitee.com/focus-creative-games/obfuz.git?path=com.code-philosophy.obfuz#v1.0.0-alpha`。

## 支持的Unity版本与平台

- 支持Unity 2019+版本
- 支持团结引擎 1.0.0+版本
- 支持所有Unity和团结引擎支持的平台
- 支持Mono和IL2CPP backend。但对Mono backend测试较少，如有遇到问题，请及时报告给我们。

事实上，更早的Unity版本也是支持的，只是可能需要解决与Unity 构建工作流的兼容问题。有需要的开发者可修改`com.code-philosophy.obfuzEditor/Unity/ObfuscationProcess.cs`的代码以兼容更早的版本。

## 解决与HybridCLR兼容问题

Obfuz和HybridCLR插件都包含了dnlib插件。对于Unity 2021及更早版本，当两个package中包含同名插件时会产生错误。
解决办法为将这两个插件之一（不必两个都改为本地安装）改为本地安装，即将Obfuz或HybridCLR下载到本地，移除其中包含的dnlib.dll，再放到Packages目录下。
