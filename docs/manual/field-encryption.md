# 字段加密

加密字段值可以有效阻止恶意攻击者使用内存篡改之类的手段，保护代码安全。

## 支持的变量类型

目前支持类静态变量，成员变量的加密，但不支持函数内普通临时变量的加密。支持加密的字段类型有：

- int、uint
- long、ulong
- IntPtr、UIntPtr
- float
- double

## 实现原理

- 字段写入前先使用`EncryptionService<Scope>::Encrypt`对值进行加密
- 字段读取前先使用`EncryptionService<Scope>::Decrypt`对值进行解密

Obfuz会修改所有程序集中对该加密字段的读取和写入操作。这个加密过程对程序集是完全无感的。Obfuz的字段加密算法会保证0值映射到0值，因此

注意Obfuz只保证代码中读取和写入加密字段时会执行加解密操作，如果通过反射则直接操作的是加密后的变量，这会引发错误。
MonoBehaviour、ScriptableObject及NewtonsoftJson之类的序列化库深度依赖反射去读取和赋值字段，它们与字段加密不兼容，
因此**不要把这些字段配置为加密**。

## 设置

`ObfuzSettings.FieldEncryptSettings`中包含常量加密相关设置，详细见文档[设置](./configuration)。

## 加密级别

加密级别影响调用`EncryptionService<Scope>::Encrypt`时传递的`ops`参数。关于ops参数的详细介绍可见文档[加密](./encryption)。

加密级别取值范围为`[1-4]`,加密时会生成跟指令数与加密级别的值相同个数的ops。只要开启常量加密即可有效阻止破解，加密级别大小对反破解的难度提升不大，建议默认取1即可。

`FieldEncryptSettings.EncryptionLevel`字段可以设置全局默认加密级别。

## 规则文件

由于字段加密会影响字段的读写性能，因此默认情况下**不会加密任何字段**。

由于被加密的字段一般只是极少数，因此设计上它的优先级高于Obfuscation Pass规则，但低于`[ObfuzIgnore]`。

支持通过规则文件精细地控制字段加密的范围和效果。`FieldEncryptSettings.RuleFiles`选项中可以配置0-N个规则文件。
规则文件的相对路径为项目目录，有效的规则文件路径类似这样：`Assets/XXX/YYY.xml`。

配置示例如下：

```xml

<?xml version="1.0" encoding="UTF-8"?>

<obfuz>
    <assembly name="Obfus1">
        <type name="*">
            <field name="a" encrypt="1"/>
            <field name="a" encrypt="0"/>
        </type>
    </assembly>
</obfuz>
```

- 顶层tag必须是obfuz
- 次级tag必须是assembly

### assembly

|属性|可空|默认值|描述|
|-|-|-|-|
|name|否||程序集名，必须在混淆程序集列表中|

assembly的子元素只能为type。

### type

|属性|可空|默认值|描述|
|-|-|-|-|
|name|否||类型名的通配字符串，如果为空表示匹配所有类型|

由于字段加密只能作用于字段，因此type的子元素只能为field。

### field

|属性|可空|默认值|描述|
|-|-|-|-|
|name|否||类型名的通配字符串，如果为空表示匹配所有类型|
|encrypt|是|0|是否加密此字段|

## EncryptFieldAttribute

EncryptFieldAttribute提供代码中便捷地标记某个字段为加密字段的办法。

它的优先级高于Obfuscation Pass规则和`[ObfuzIgnore]`。只要对某个字段添加了`[EncryptField]`特性，即使字段及所有类型有`[ObfuzIgnore]`特性，仍然会被加密。

示例代码：

```csharp

[ObfuzIgnore]
class A
{
  [EncryptField]
  public int x1; // 变量x1仍然会被加密，无视类型上的[ObfuzIgnore]
  
  [ObfuzIgnore]
  [EncryptField]
  public int x2; // 变量x2仍然会被加密，无视字段上的[ObfuzIgnore]

  public int y; // 变量y不会加密，也不会被释加任何混淆或加密Pass
}

```
