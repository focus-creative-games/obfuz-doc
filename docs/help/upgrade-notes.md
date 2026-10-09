# 版本升级说明

本文档介绍当前版本（`v4.x`）相对于上一个版本（`v3.x`）的改动，以及升级时需要注意的事项。

旧版本的文档仍然可以通过页面右上角的版本下拉框切换到 `v3.x` 查看。

## 改动概览

|改动|影响|
|-|-|
|移除了多态dll的支持|使用了多态dll的工程需要移除相关配置与构建流程|
|禁用了执行栈混淆（`EvalStackObfus`）|开启该pass不会生效|
|禁用了代码水印（`WaterMark`）|开启该pass不会生效|
|obfuz4hybridclr要求HybridCLR `v9.0.0+`|低版本HybridCLR的工程需要升级，或继续使用obfuz4hybridclr `v3.x`|

## 移除了多态dll的支持

`v4.0.0`移除了多态dll（Polymorphic Dll）功能，obfuz与obfuz4hybridclr中相关的代码、设置和代码生成模板均已删除。

具体来说：

- `ObfuzSettings`中不再有`PolymorphicDllSettings`，即原先的`Enable`、`Code Generation Secret Key`、`Disable Load Standard Dll`等选项全部不再存在。
- obfuz4hybridclr不再生成多态dll相关的C++代码（`PolymorphicRawImage`等）。

### 如何升级

- 如果你的工程没有开启多态dll，则不需要做任何事情。
- 如果你的工程开启了多态dll，升级后相关设置会自动失效。请检查你的构建脚本，移除对多态dll相关接口的调用；同时清理`HybridCLRData`目录下由旧版本生成的多态dll相关的C++文件，避免残留文件导致il2cpp编译失败。
- 如果你仍然依赖多态dll功能，请继续使用obfuz `v3.x`版本。

多态dll的文档参见`v3.x`版本文档中的[多态dll](https://www.obfuz.com/docs/3.x/manual/hybridclr/polymorphic-dll)。

## 禁用了执行栈混淆

[执行栈混淆](../manual/eval-stack-obfuscation)pass已被禁用，即使在`ObfuscationPasses`中开启`EvalStackObfus`也不会生效。

原因是该pass的性价比过低：它会显著增大混淆后的程序集体积，但带来的逆向难度提升有限。如果后续无法优化，该功能可能会被彻底移除。

`EvalStackObfusSettings`中的设置依然保留，但不会产生任何效果。

### 如何升级

无需修改配置。如果你之前依赖该pass提高混淆强度，建议改用[表达式混淆](../manual/expr-obfuscation)与[控制流混淆](../manual/control-flow-obfuscation)。

## 禁用了代码水印

[代码水印](../manual/watermark)pass已被禁用，即使在`ObfuscationPasses`中开启`WaterMark`也不会生效。

原因是在某些特殊指令位置插入指令会导致`il2cpp.exe`执行失败，例如在`ldtoken`与`RuntimeHelpers.InitializeArray`调用之间插入指令。

`WatermarkSettings`中的设置依然保留，但不会产生任何效果。

### 如何升级

无需修改配置。

## obfuz4hybridclr要求HybridCLR v9.0.0+

:::warning

obfuz4hybridclr自`v4.0.0`版本起，仅支持HybridCLR `v9.0.0`及以上版本。

:::

HybridCLR `v9.0.0`调整了构建流程相关的接口，obfuz4hybridclr `v4.0.0`已适配新接口，因此不再兼容更低版本的HybridCLR。

### 如何升级

二者选其一：

- 将HybridCLR升级到`v9.0.0`及以上版本，然后使用obfuz4hybridclr `v4.x`。
- 保持HybridCLR为低版本，继续使用obfuz4hybridclr `v3.x`。

注意obfuz与obfuz4hybridclr的大版本号需要保持一致，即obfuz4hybridclr `v4.x`需要配合obfuz `v4.x`使用。

详细文档见[与HybridCLR协同工作](../manual/hybridclr/work-with-hybridclr)。

## 相关文档

- [发布日志](./releaselog)
- [混淆pass](../manual/obfuscation-pass)
- [设置](../manual/configuration)
