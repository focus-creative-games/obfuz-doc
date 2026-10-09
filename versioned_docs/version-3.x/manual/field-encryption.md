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

Obfuz会修改所有程序集中对该加密字段的读取和写入操作，这个加密过程对程序集是完全无感的。Obfuz的字段加密算法会保证0值映射到0值，
因此无需对0值额外初始化。

:::warning
注意Obfuz只保证代码中读取和写入加密字段时会执行加解密操作，如果通过反射则直接操作的是加密后的值。
:::

## 与序列化库的兼容性

对于序列化库有以下几种情况：

- 如果使用生成代码的方式去序列化字段，读取和写入操作都会经过解密和加密操作，跟手写代码一样，完全不会有问题。
- 如果使用反射方式读取Property类型的字段，由于Property函数读写底层数据也经过了解密和加密操作，也不会有问题。
- 如果使用使用反射的方式去保存加密后字段数据，然后再用反射的方式读入加密后字段数据，也不会有问题。
- 如果使用反射的方式保存字段原始值，然后在代码中直接访问字段，由于字段未经过加密，读取时执行了解密操作，最终数据是错误的。

以NewtonsoftJson为例：

- 如果先用Newtonsoftjson保存对象数据到json文件，后续再反序列化json文件的数据到对象，不会有问题。
- 如果直接手写一个json文件，字段值是未加密的值，反序列化json文件到对象，则这些未加密的字段经过额外解密后反而错了。

MonoBehaviour之类的也类似，如果你在inspector中设置了某字段的值，由于Unity使用反射获得字段值，它保存和加载操作的都是原始值。
当你在代码中访问该字段时，会错误地获得经过解密操作的值。

## 设置

`ObfuzSettings.FieldEncryptSettings`中包含常量加密相关设置，详细见文档[设置](./configuration)。

## 加密级别

加密级别影响调用`EncryptionService<Scope>::Encrypt`时传递的`ops`参数。关于ops参数的详细介绍可见文档[加密](./encryption)。

加密级别取值范围为`[1-4]`,加密时会生成跟指令数与加密级别的值相同个数的ops。只要开启常量加密即可有效阻止破解，加密级别大小对反破解的难度提升不大，建议默认取1即可。

`FieldEncryptSettings.EncryptionLevel`字段可以设置全局默认加密级别。

## EncryptFieldAttribute

EncryptFieldAttribute提供代码中便捷地标记某个字段为加密字段的办法，详细文档见[Obfuz CustomAttributes](./customattributes)。

它的优先级高于Obfuscation Pass规则和`[ObfuzIgnore]`。只要对某个字段添加了`[EncryptField]`特性，即使字段及所在类型有`[ObfuzIgnore]`特性，仍然会被加密。

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
            <field name="a"/>
            <field name="b"/>
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
|name|否||类型名的通配字符串，如果为空表示匹配所有类型。嵌套类型使用`/`划分声明所在类型和被包围的子类型，如`test.ClassA/ClassB`。|

由于字段加密只能作用于字段，因此type的子元素只能为field。

### field

|属性|可空|默认值|描述|
|-|-|-|-|
|name|否||被加密的字段名。字段名的通配字符串，如果为空表示匹配所有类型|
