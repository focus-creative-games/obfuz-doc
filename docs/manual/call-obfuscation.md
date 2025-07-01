# 函数调用混淆

函数调用混淆会混淆代码中调用函数（静态、成员、虚函数）的方式，反编译代码后无法直接知晓运行了哪个函数，有效保护了代码安全。

## 实现原理

对于每一个函数调用`xxx Foo(T1 p1, T2 p2 ,,)`：

- 将被调用的函数按照函数的签名分组，每个函数分配组内一个唯一index。
- 使用`EncryptionService<Scope>::Encrypt(int value, int ops, int salt)`计算出index被加密后encryptedIndex。
- 在调用函数的地方，先调用`EncryptionService<Scope>::Decrypt(int value, int ops, int salt)` 解密计算出原始index。
- 将原始函数调用替换为`xxx $Dispatch(T1 p1, T2 p2,,, int index)`

encrypedIndex在执行该代码位置时才被解密，反编译代码后无法直接得知调用了哪个函数，有效地增加了代码被破解的难度！

## 设置

`ObfuzSettings.CallEncryptSettings`中包含常量加密相关设置，详细见文档[设置](./configuration)。

## Proxy Mode

有多种对函数调用进行混淆的方法。

|Mode|描述|
|-|-|
|Dispatch|将函数调用转化成通过另一个dispatch函数间接调用的方式，通过dispatch函数的index决定实际调用的函数。index值是一个加密的值，只有运行时才会解密，因此可以很好阻止破解者分析调用关系。|
|Delegate|将函数调用转化为一个预计算的delegate。delegate对象在运行时才绑定到一个`delegate[]`的某个index对应的元素。index值是一个加密的值，只有运行时才会解密，因此可以很好阻止破解者分析调用关系。|

Delegate与Dispatch的混淆程度及运行性能没有显著的区别。Delegate相比Dispatch的优点是生成的混淆代码更稳定，当代码变动时，生成的混淆代码差异更小。

对于大多数项目建议取Dispatch模式即可。对于HybridCLR的旗舰版本用户，减少代码变动可以减少切换为解释执行执行的函数的数量，提升DHE的性能，因此建议取Delegate模式。

## 加密级别

加密级别影响调用`EncryptionService<Scope>::Encrypt`时传递的`ops`参数。关于ops参数的详细介绍可见文档[加密](./encryption)。

加密级别取值范围为`[1-4]`,加密时会生成跟指令数与加密级别的值相同个数的ops。只要开启常量加密即可有效阻止破解，加密级别大小对反破解的难度提升不大，建议默认取1即可。

`CallEncryptSettings.EncryptionLevel`字段可以设置全局默认加密级别。

## 规则文件

默认情况下Obfuz会加密所有函数调用，但也支持规则文件精细地控制常量加密的范围和效果。`CallEncryptSettings.RuleFiles`选项中可以配置0-N个规则文件。
规则文件的相对路径为项目目录，有效的规则文件路径类似这样：`Assets/XXX/YYY.xml`。

配置示例如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>

<obfuz>
  <whitelist>
    <assembly name="mscorlib" obfuscate="0"/>
    <assembly name="UnityEngine.*" obfuscate="0"/>
    
    <assembly name="Obfus2">
      <type name="Banana" obfuscate="0"/>
      <type name="*.TestTypeAllMethodNotObfus" obfuscate="0"/>
      <type name="*.TestTypeSomeMethodNotObfus">
          <method name="NotObfus*"/>
      </type>
    </assembly>
  </whitelist>
  
  <global obfuscationLevel="Basic">

  </global>
  
  <assembly name="Obfus2">
      <type name="*.TestNotObfusTypeAllMethods" obfuscationLevel="None"/>
      <type name="*.TestNotObfusTypeSomeMethods">
          <method name="NotObfus*" obfuscationLevel="None"/>
      </type>
      <type name="Aaaa.TopClass/SubClass" obfuscationLevel="Advanced">
      </type>
  </assembly>
</obfuz>
```

- 顶层tag必须是obfuz
- 次级tag可以是whitelist、global及assembly

### whitelist

whitelist配置了被调用的函数的白名单，白名单内的函数不会被加密，这个设置对所有程序集都生效。

#### assembly

|属性|可空|默认值|描述|
|-|-|-|-|
|name|是|无|名字为通配符表达式，如果为空，则表示匹配所有程序集|
|obfuscate|是|1|是否是混淆调用本程序集内的函数|

assembly的子元素类型只能是type。

#### type

|属性|可空|默认值|描述|
|-|-|-|-|
|name|是|无|名字为通配符表达式，如果为空，则表示匹配所有程序集。嵌套类型使用`/`划分声明所在类型和被包围的子类型，如`test.ClassA/ClassB`。|
|obfuscate|是|继承assembly的同名字段的值|是否是混淆调用本类型内的函数|

type的子元素类型只能是method。

#### method

|属性|可空|默认值|描述|
|-|-|-|-|
|name|是|无|名字为通配符表达式，如果为空，则表示匹配所有程序集|
|obfuscate|是|继承type的同名字段的值|是否是混淆对本函数的调用|

### global

global中定义了全局默认加密参数，。

|属性|可空|默认值|描述|
|-|-|-|-|
|obfuscationLevel|是|None|混淆级别，可以取None、Basic、Advanced、MostAdvanced这几个值|

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
