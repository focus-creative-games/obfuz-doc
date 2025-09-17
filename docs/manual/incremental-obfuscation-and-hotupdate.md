# 增量混淆与代码热更新

Obfuz支持增量混淆，大多数Obfusaction Pass会尽力保持混淆的稳定性。

- Symbol Obfuscation 使用symbol mapping文件保证混淆的稳定性。
- Const Obfuscation 对于每个常量使用确定性的随机加密算法。
- Field Encryption 对于每个字段使用确定性的随机加密算法。
- Call Obfusaction 对于每个被调用函数使用确定笥的随机加密算法。

## 构建流程中的混淆

只需要保持设置稳定，构建流程会自动保持混淆的稳定性。

## 单独执行混淆

只要混淆设置没有修改，跟构建流程中的混淆一样，会自动保持混淆的稳定性。具体文档见[单独执行混淆](./run-obfuscation-standalonely)。

## 代码热更新

代码热更新中的混淆与单独执行混淆的流程完全相同。

如果不考虑增量混淆的稳定性，可以修改以下参数让每次热更新的代码的混淆结果尽可能不一样：

- 删除symbol mapping文件中热更新代码相关的配置段
- 修改 `SecretSettings.DefaultDynmaicSecretKey`字段
- 修改 `SecretSettings.RandomSeed`字段

修改`ConstEncrypSettings.EncryptionLevel`、`FieldEncryptSetings.EncryptionLevel`、`CallObfusSettings.ObfuscationLevel`也可以影响混淆结果。
不过增大这些值会造成加密性能下降，所以建议不要频繁修改它。
