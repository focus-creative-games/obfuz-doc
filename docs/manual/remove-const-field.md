# 移除常量字段

const常量字段大多数情况下只在源码中有意义，编译为dll时会inline对常量字段的访问，即编译后的代码并不会引用const字段。
因此移除const字段并不会引发代码错误，除非需要反射访问该字段。

移除const字段可以减少混淆后的代码的有效信息，因此混淆时默认会移除这些字段。

## 设置

`ObfuzSettings.RemoveConstFieldSettings`中包含相关设置，详细见文档[设置](./configuration)。

## `[ObfuzIgnore]`

被`[ObfuzIgnore(ObfuzScope.Field)]`影响的常量字段不会被移除。

例如下面的ConstEncryptTestClass类的removedField会被移除，而preservedField和preservedField2字段都会被保留。

```csharp
    class ConstEncryptTestClass
    {
        // This const field should be removed by the obfuscator.
        public const int removedField = 1;

        [ObfuzIgnore(ObfuzScope.Field)]
        public const int preservedField = 2;

        [ObfuzIgnore]
        public const int preservedField2 = 2;
    }
```

## 规则文件

支持通过规则文件精细地控制保留哪些常量字段。`RemoveConstFieldSettings.RuleFiles`选项中可以配置0-N个规则文件。
规则文件的相对路径为项目目录，有效的规则文件路径类似这样：`Assets/XXX/YYY.xml`。

出现在规则文件中的字段**不会被移除**。

配置示例如下：

```xml

<?xml version="1.0" encoding="UTF-8"?>

<obfuz>
    <assembly name="Obfus1">
        <type name="Tests.RemoveConstField.ConstEncryptTestClass">
            <field name="preservedField2"/>
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
|name|否||要保留的常量字段名。字段名的通配字符串，如果为空表示匹配所有类型。|
