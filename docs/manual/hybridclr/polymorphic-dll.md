# 多态dll文件

默认情况下`Assembly.Load`需要传入标准的dll文件，意味着恶意破解者有办法获得完整的原始dll文件，或者加载恶意的第三方dll，这给开发者带来巨大的安全风险。
即使对dll文件进行加密，恶意破解者只要hook了`Assembly.Load`入口位置，仍然可以dump出完整的原始dll文件。

obfuz通过支持多态dll文件，有效对抗这种dump或者篡改dll的行为。

## 特性

- 全新的dll文件结构，无法再被ILSpy等常规dll反编译工具打开。
- 全新的metadata结构，无法再被轻易还原为原始的CLI metadata数据。
- **支持dll文件结构和metadata结构随机化**，几十个metadata结构和几百个元数据字段完全随机化，每个开发者的最终dll结构都不一样，巨幅提高恶意破解者的破解成本。
- 支持禁止加载标准的dll文件，阻止通过调用`Assembly.Load`加载恶意dll。

## 设置

`ObfuzSettings.PolymorphicDllSettings`中包含多态dll相关设置，详细见文档[设置](../configuration)。

:::tip

HybridCLR自v8.4.0版本起支持自定义dll文件结构，要开启多态dll支持，要求HybridCLR版本不低于`v8.4.0`。

:::

### codeGenerationSecretKey

codeGenerationSecretKey是生成多态dll代码时使用的随机化密钥。**请不要使用默认值**，长度在10以上并且使用较复杂的字符组合。

修改codeGenerationSecretKey后会生成完全不同的dll文件结构，这个文件结构固化在二进制代码中，在发布App后完全固定。
发布热更新dll时请**不要**修改这个值，会导致加载失败！

建议是发布新App包时更换这个值。如果同时存在多个版本的App包，并想使用相同的多态dll，请保持codeGenerationSecretKey一致。

### disableLoadStandardDll

是否禁止加载标准结构的dll。开启此项后Assembly.Load或者RuntimeApi.LoadMetadataForAOTAssembly必须传入多态dll，如果传入标准dll，会返回错误。

开启此选项可以有效对抗恶意破解者运行时注入第三方dll，因为它们很难构造出符合多态dll结构的dll，大幅提高注入成本。

## 让HybridCLR支持多态dll

已经在`HybridCLR/ObfuzExtension/GenerateAll`命令中插入了生成多态dll代码的调用。只要`PolymorphicDllSettings.enable`为true就会自动在`GenerateAll`时
生成相关代码。

如果想主动调用生成，可以调用`ObfuscateUtil::GeneratePolymorphicCodes(string libil2cppDir)`函数。

## 生成多态dll

调用`ObfuscateUtil::GeneratePolymorphicDll(string originalDllPath, string outputDllPath)`生成多态dll。

普通热更新程序集、DHE程序集、**补充元数据程序集**都可以使用多态dll。
