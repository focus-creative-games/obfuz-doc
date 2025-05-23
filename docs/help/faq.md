# 常见问题

## 构建或者手动混淆时发生异常

### `ArgumentExcption: An item with same key has already  been added. Key:object Item. - Obfuz.ObfusPasses.SymbolObfus.RenameRecordMap:LoadPropertyMapping`

旧版本如果定义了几个相同名字的带参Property（如`operator []`）时会产生这个问题。请更新到最新版本，同时**删除旧的`symbol-mapping.xml`文件**（默认在`Assets/Obfuz/symbol-mapping.xml`）。

### il2cpp 构建过程中打印错误日志，某些类型、字段、函数、property、event打不到。这些找不到的元数据的名称是原始的未混淆的名称

应该是出错的程序集引用了被混淆程序集，但你没有把它加入到`ObfuzSettings.AssemblySettings.NonObfuscatedButReferenceingObfuscatedAssemblies`列表。
如果不加到此列表，被混淆的元数据修改时不会同步修改这些引用了它的程序集中的引用符号，导致出错。详细文档见[程序集](../manual/assembly)和[符号混淆](../manual/symbol-obfuscation)。


## 运行过程中发生异常

### `exception:The type initializer for '$$Obfuz$RVA$' threw an exception., stack:  at ...`

还未初始化`EncrytionService<T>::Encryptor`就运行了混淆代码。解决办法为先初始化`EncryptionService<T>::Encryptor`，详细文档见[初始化Encryptor](../manual/encryption.md#初始化encryptor)。

## 其他

### obfuz 对代码有什么限制吗？

没有。

### obfuz能混淆中文类型名或者字段吗？

能。

## obfuz 对性能有多大影响？

除了符号混淆外的混淆Pass都对性能有影响，但具体影响大小无法简单一概而论。如果测试发现性能下降较多，可以考虑禁用掉一些不必要的pass或者使用规则对某些代码的禁用混淆。
