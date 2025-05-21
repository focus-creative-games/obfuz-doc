# 常见问题

## 运行时遇到异常 `exception:The type initializer for '$$Obfuz$RVA$' threw an exception., stack:  at ...`

还未初始化`EncrytionService<T>::Encryptor`就运行了混淆代码。解决办法为先初始化`EncryptionService<T>::Encryptor`，详细文档见[初始化Encryptor](../manual/encryption.md#初始化encryptor)。
