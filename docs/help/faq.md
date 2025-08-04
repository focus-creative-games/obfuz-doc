# 常见问题

## 构建或者手动混淆时发生异常

### `ArgumentExcption: An item with same key has already  been added. Key:object Item. - Obfuz.ObfusPasses.SymbolObfus.RenameRecordMap:LoadPropertyMapping`

旧版本如果定义了几个相同名字的带参Property（如`operator []`）时会产生这个问题。请更新到最新版本，同时**删除旧的`symbol-mapping.xml`文件**（默认在`Assets/Obfuz/symbol-mapping.xml`）。

### il2cpp 构建过程中打印错误日志，某些类型、字段、函数、property、event找不到。这些找不到的元数据的名称是原始的未混淆的名称

应该是出错的程序集引用了被混淆程序集，但你没有把它加入到`ObfuzSettings.AssemblySettings.NonObfuscatedButReferenceingObfuscatedAssemblies`列表。
如果不加到此列表，被混淆的元数据修改时不会同步修改这些引用了它的程序集中的引用符号，导致出错。详细文档见[程序集](../manual/assembly)和[符号混淆](../manual/symbol-obfuscation)。

### 构建过程中混淆成功了，但il2cpp生成代码过程中出现错误

有几个原因：

1. Obfuz生成的混淆dll有bug
2. il2cpp对dll中元数据的名称有要求而obfuz未满足其隐式要求而出错。
3. Obfuz解决了此问题，但旧版本obfuz生成的symbol-mapping.xml文件仍然迫使它使用了一个非法或与il2cpp不兼容的混淆

解决办法：

1. 删除symbol-mapping.xml
2. 更新Obfuz到最新版本

还无法解决，请构造出复现工程，向我们报告。

### `[ReflectionCompatiblityDetector] Refleciton compatility issue in ...`

Symbol Obfusaction Pass会检测混淆符号名称后潜在的反射或者其他逻辑上可能出现错误的代码。Obfuz无法准确判断某种潜在出错的代码是不是真的有问题。
对于这种错误或者警告，请人工核实。如果确实无问题，可以忽略这个错误或者警告日志。

如果已经检查了所有代码都没有问题，不想看到这些日志，你可以在ObfuzSettings.SybmolObfusSettings中禁用反射兼容性检测，详细文档见[符号混淆](../manual/symbol-obfuscation)。

## 运行过程中发生异常

### TypeLoadException: Could not resolve type with token 010001ec from typeref (expected class '$a.$d`1' in assembly 'Obfuz.Runtime, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null')

**不要在Editor下**测试混淆程序集。

在Editor下已经存在被混淆的程序集（包括Obfuz.Runtime）的原始未混淆的代码。混淆程序集引用的是混淆后的类型和函数，
运行时会出现找不到类的错误！

### `exception:The type initializer for '$$Obfuz$RVA$' threw an exception., stack:  at ...`

还未初始化`EncrytionService<T>::Encryptor`就运行了混淆代码。解决办法为先初始化`EncryptionService<T>::Encryptor`，详细文档见[初始化Encryptor](../manual/encryption.md#初始化encryptor)。

## 其他

### obfuz 对代码有什么限制吗？

没有。

### obfuz能混淆中文类型名或者字段吗？

能。

## obfuz 对性能有多大影响？

除了符号混淆外的混淆Pass都对性能有影响，但具体影响大小无法简单一概而论。如果测试发现性能下降较多，可以考虑禁用掉一些不必要的pass或者使用规则对某些代码的禁用混淆。
