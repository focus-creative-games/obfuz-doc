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
  
  <global disableObfuscation="0" obfuscateCallInLoop="1"  cacheCallIndexInLoop="1" cacheCallIndexNotInLoop="0">

  </global>
  
  <assembly name="Obfus2">
      <type name="*.TestNotObfusTypeAllMethods" disableObfuscation="1"/>
      <type name="*.TestNotObfusTypeSomeMethods">
          <method name="NotObfus*" disableObfuscation="1"/>
      </type>
      <type name="*.TestObfusCache">
          <method name="NotCache" cacheCallIndexInLoop="0"/>
          <method name="Cache" cacheCallIndexInLoop="1"/>
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
|name|是|无|名字为通配符表达式，如果为空，则表示匹配所有程序集|
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
|disableObfuscation|是|0|是否禁用加密，它的优先级高于`obfuscateCallInLoop`之类的参数|
|obfuscateCallInLoop|是|1|是否混淆循环中的函数调用。由于循环会多次执行，如果加密循环中的常量可能会对性能影响较大。例如 `for (int i = 0; i < 100; i++) { a.Call(); }` 启动循环加密后会显著降低性能 |
|cacheCallIndexInLoop|是|1|是否缓存循环中的dispatch函数的index变量。如果为是，则会在静态变量中保存解密后的index值，避免每次的解密开销。|
|cacheCallIndexNotInLoop|是|0|是否缓存不在循环中的dispatch函数的index变量。|

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
