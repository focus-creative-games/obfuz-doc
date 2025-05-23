# 函数体混淆

函数体混淆实际叫代码混淆。Obufz中对函数体混淆的Obfuscation Pass有一些统一的规则，因此在本文档中单独介绍。

## 相关Pass

- 常量混淆
- 调用混淆

## 默认禁用函数体混淆的目标

Obfuz已经尽力考虑Unity引擎下常见的需要禁用函数体混淆名称的场合，以下目标不会被混淆，也不会受规则文件的影响:

- `Obfuz.Runtime`程序集内所有代码都不会被混淆
- 名字含`$Obfuz$`前缀的类型是Obfuz生成的，它们的所有成员函数体不会被混淆
- 名字含`$Obfuz$`前缀的函数是Obfuz生成的，它们的函数体不会被混淆
- `Obfuz.EncryptionVM.GeneratedEncryptionVirtualMachine`类的所有函数体都不会被混淆
- 标记了`[RuntimeInitializeOnLoadMethod]`，并且加载时机等于或者早于`RuntimeInitializeLoadType.AfterAssembliesLoaded`的函数体不会被混淆
