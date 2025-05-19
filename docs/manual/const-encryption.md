# 常量加密

加密代码中出现的常量可以有效保护代码安全。

## 支持的常量类型

目前支持以下常量类型：

- byte、sbyte
- short、ushort
- int、uint
- long、ulong
- IntPtr、UIntPtr
- string

将来会进一步支持加密**数组类型**常量。

## 实现原理

- 使用`EncryptionService<Scope>::Encrypt`先计算出把**常量**加密后的值encryptedValue
- 将encryptedValue保存rvaData（rva是dll中一种保存大量连续数据的方式）。
- 将代码中的常量替换为`EncryptionService<Scope>::DecryptFromRva{Int|Long|Float|Double|String|Bytes}(byte[] rvaData, int offset, [int length, ] int ops, int salt)`表达式。

rvaData也是以加密形式保存的，即每个常量在被运行时解密时需要发生两步解密：先对rvaData解密，再从rvaData中读取出encryptedValue后解密。

## 设置

`ObfuzSettings.ConstEncryptSettings`中包含常量加密相关设置，详细见文档[设置](./configuration)。

## 加密级别

加密级别影响调用`EncryptionService<Scope>::DecryptFromRvaXX`时传递的`ops`参数。关于ops参数的详细介绍可见文档[加密](./encryption)。

加密级别取值范围为`[1-4]`,加密时会生成跟指令数与加密级别的值相同个数的ops。只要开启常量加密即可有效阻止破解，加密级别大小对反破解的难度提升不大，建议默认取1即可。

`ConstEncryptSettings.EncryptionLevel`字段可以设置全局默认加密级别。

## 加密规则

