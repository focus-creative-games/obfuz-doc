# 常见问题

## 构建或者手动混淆时发生异常

### `ArgumentExcption: An item with same key has already  been added. Key:object Item. - Obfuz.ObfusPasses.SymbolObfus.RenameRecordMap:LoadPropertyMapping`

旧版本如果定义了几个相同名字的带参Property（如`operator []`）时会产生这个问题。请更新到最新版本，同时**删除旧的`symbol-mapping.xml`文件**（默认在`Assets/Obfuz/symbol-mapping.xml`）。

## 运行过程中发生异常

### `exception:The type initializer for '$$Obfuz$RVA$' threw an exception., stack:  at ...`

还未初始化`EncrytionService<T>::Encryptor`就运行了混淆代码。解决办法为先初始化`EncryptionService<T>::Encryptor`，详细文档见[初始化Encryptor](../manual/encryption.md#初始化encryptor)。
