# 反射与序列化

[符号混淆](./symbol-obfuscation)会修改各种元数据的名称。这使得通过名称去反射查找类型、函数、字段等信息会失败。
Unity的内建序列化机制如MonoBehaviour、ScriptableObject、JsonUtility都重度依赖反射信息，因此如果没有特殊
处理，符号混淆后这些功能都会无法正常工作。

## Obfuz对Unity的特殊支持

Obfuz与Unity工作流深度集成，目前会对Unity有一些特殊处理：

- 不会混淆MonoBehaviour、ScriptableObject及标注了`[Serialiable]`特性的类型的类型名、命名空间
- 不会混淆以上类型的参与序列化的字段，包括标注了`[SerializedField]`特性的私有字段
- 不会混淆MonoBehavior中`Awake`、`Start`之类的有特殊用途的事件函数

Obfuz没有处理场景对象上的`UnityEvent`字段，因此如果在`Inspector`中设置了`UnityEvent`类型字段的回调函数，需要禁用这些函数的符号混淆，
否则运行时将出现找不到回调函数的错误。

## 对某些元数据禁用符号混淆

有几种方式：

1. [Obfuscation Pass](./obfuscation-pass)中配置对某些元数据禁用`Symbol Obfus` Pass。
2. [符号混淆](./symbol-obfuscation)的规则文件中配置对某些元数据禁用符号混淆。
3. 在代码中给需要禁用符号混淆的元数据上添加`[ObfuzIgnore]`特性， 文档[ObfuzIgnoreAttribute](./obfuzignore)。

## 解决与Newtonsoft.Json之类序列化库的兼容问题

对需要序列化的类型添加`[Serializable]`特性可让它们的public字段不被混淆，但他们的public 属性仍然会被混淆。因此如果
代码中使用到依赖于Property的序列化，请对这些类型的property禁用符号混淆。符号混淆的示例规则配置如下：

```xml

<obfuz>
  <assembly name="YouAsse">
    <type name="NameOrWildcardName" obName="0">
      <field/>
      <property/>
      <!--默认情况下method和event会继承type的obName属性，如果想让method和event被混淆，添加以下配置-->
      <method obName="1"/>
      <event obName="1"/>
    <type>
  </assembly>
</obfuz>

```
