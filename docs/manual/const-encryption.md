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

## 规则文件

默认情况下Obfuz会加密所有常量，但也支持规则文件精细地控制常量加密的范围和效果。`ConstEncryptSettings.RuleFiles`选项中可以配置0-N个规则文件。
规则文件的相对路径为项目目录，有效的规则文件路径类似这样：`Assets/XXX/YYY.xml`。

配置示例如下：

```xml

<?xml version="1.0" encoding="UTF-8"?>

<obfuz>

    <whitelist type="int">1000,456</whitelist>
    <whitelist type="long">100000000000,45600000000</whitelist>
    <whitelist type="string">aaabbb</whitelist>
    <whitelist type="int-range">-100,200</whitelist>
    <whitelist type="long-range">-10000000000,20000000000</whitelist>
    <whitelist type="float-range">-100,200</whitelist>
    <whitelist type="double-range">-100,200</whitelist>
    <whitelist type="string-length-range">,3</whitelist>
    <whitelist type="array-length-range">1,3</whitelist>

    <global disableEncrypt="0" encryptInt="1" encryptLong="1" encryptFloat="1" encryptDouble="1" encryptArray="1" encryptString="1"
        encryptConstInLoop="1" encryptStringInLoop="1" cacheConstInLoop="1" cacheConstNotInLoop="0" cacheStringInLoop="1" cacheStringNotInLoop="1">
    </global>
    
    <assembly name="Obfus1" cacheConstInLoop="1" cacheConstNotInLoop="0">
        <type name="*">
            <method name="*" cacheConstInLoop="1"/>
        </type>
    </assembly>
</obfuz>
```

- 顶层tag必须是obfuz
- 次级tag可以是whitelist、global及assembly

### whitelist

whitelist配置了常量白名单，白名单内的常量不会被加密，这个设置对所有程序集都生效。

|type|描述|
|-|-|
|int|int常量列表，使用`,`分割，可以为0-N个。|
|long|long常量列表，使用`,`分割，可以为0-N个。|
|string|字符串常量，只能填一个。注意由于xml格式自身的原因，如果字符串前后及中间的空白字符会被忽略，需要使用转义字符`&lt;`要表示这些特殊字段。|
|int-range|int整数范围，取值范围为闭区间。例如`100-100`表示`[100, 100]`，即所有大于等于10及小于等100的整数。支持下界或上界为空，表示无限制。如`,100`表示小于等于100的所有整数；`100,`表示大于等于100的所有整数；`,`表示所有整数。|
|long-range|long整数范围，规则与int-range相同。|
|float-range|float范围，规则与int-range相同。|
|double-range|double范围，规则与int-range相同。|
|string-length-range|字符串长度范围，符合该长度范围的字符串不会被加密。规则与int-range相同。|
|array-length-range|常量数组的长度范围，符合该长度范围的常量数组不会被加密。规则与int-range相同。**由于目前还不支持常量数组加密，此配置项目前没有实际效果。**|

### global

global中定义了全局默认加密参数，。

|属性|可空|默认值|描述|
|-|-|-|-|
|disableEncrypt|是|0|是否禁用加密，它的优先级高于`encryptInt`之类的选项|
|encryptInt|是|1|是否启用int加密|
|encryptLong|是|1|是否启用long加密|
|encryptFloat|是|1|是否启用float加密|
|encryptDouble|是|1|是否启用double加密|
|encryptString|是|1|是否启用string加密|
|encryptArray|是|1|是否启用常量数组加密。由于目前不支持常量数组加密，此配置项没有实际效果|
|encryptConstInLoop|是|1|是否加密循环中的int、long、float、double类型常量。由于循环会多次执行，如果加密循环中的常量可能会对性能影响较大。例如 `for (int i = 0; i < 100; i++) { n += 100; }` 启动循环加密后会显著降低性能 |
|encryptStringInLoop|是|1|是否加密循环中的string类型常量。|
|cacheConstInLoop|是|1|是否缓存循环中的int、long、float、double类型常量。如果缓存，则解密后的常量会被保存在一个延迟解密的静态变量中，运行时读取这个静态变量而不是执行解密操作。|
|cacheStringInLoop|是|1|是否缓存循环中的string类型常量。|
|cacheConstNotInLoop|是|0|是否缓存不在循环中的常量。|
|cacheStringNotInLoop|是|1|是否缓存不在循环中的string。由于每次解密string会产生GC，默认情况下不在循环内的字符串也会被缓存|

### assembly

|属性|可空|默认值|描述|
|-|-|-|-|
|name|否||程序集名，必须在混淆程序集列表中|
|其他|是|继承global中同名选项|global中所有选项都可以使用，如果未定义，就继承global中同名选项的值|

assembly的子元素只能为type。

### type

|属性|可空|默认值|描述|
|-|-|-|-|
|name|否||类型名的通配字符串，如果为空表示匹配所有类型|
|其他|是|继承assembly中同名选项|global中所有选项都可以使用，如果未定义，就继承assembly中同名选项的值|

由于常量只能出现在函数代码中，因此type的子元素只能为method。

### method

|属性|可空|默认值|描述|
|-|-|-|-|
|name|否||类型名的通配字符串，如果为空表示匹配所有类型|
|其他|是|继承assembly中同名选项|global中所有选项都可以使用，如果未定义，就继承assembly中同名选项的值|
