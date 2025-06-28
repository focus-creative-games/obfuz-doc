# 表达式混淆

混淆代码中出现的表达式，提高逆向难度。

## 支持的表达式类型

- 基础计算表达式 add、sub、mul、div、neg
- 基础位计算表达式 and、or、xor、not
- 左移或右移计算表达式 shl、shr

## 支持的常量类型

- int、uint
- long、ulong
- float
- double

## 设置

`ObfuzSettings.ExprObfusSettings`中包含常量加密相关设置，详细见文档[设置](./configuration)。

## 规则文件

默认情况下Obfuz会加密所有函数调用，但也支持规则文件精细地控制常量加密的范围和效果。`ExprObfusSettings.RuleFiles`选项中可以配置0-N个规则文件。
规则文件的相对路径为项目目录，有效的规则文件路径类似这样：`Assets/XXX/YYY.xml`。

配置示例如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>

<obfuz>

  <global obfuscationLevel="Basic" obfuscationPercentage="0.3">

  </global>
  
  <assembly name="Obfus2">
      <type name="*.TestNotObfusAnyMethods" obfuscationLevel="None"/>
      <type name="*.TestObfusAll" obfuscationLevel="Advanced"/>
      <type name="*.TestObfusSomeMethods" >
          <method name="Foo" obfuscationLevel="MostAdvanced"/>
      </type>
  </assembly>
</obfuz>
```

- 顶层tag必须是obfuz
- 次级tag可以是global及assembly

### global

global中定义了全局默认加密参数，。

|属性|可空|默认值|描述|
|-|-|-|-|
|obfuscationLevel|是|None|混淆级别，可以取None、Basic、Advanced、MostAdvanced这几个值|
|obfuscationPercentage|是|0.5|混淆概率。取值`[0 - 1]`之间|

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

由于函数调用只能出现在函数代码中，因此type的子元素只能为method。

### method

|属性|可空|默认值|描述|
|-|-|-|-|
|name|否||类型名的通配字符串，如果为空表示匹配所有类型|
|其他|是|继承assembly中同名选项|global中所有选项都可以使用，如果未定义，就继承assembly中同名选项的值|
