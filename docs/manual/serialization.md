# 序列化

[符号混淆](./symbol-obfuscation)会修改各种元数据的名称，Unity的内建序列化机制如MonoBehaviour、ScriptableObject、JsonUtility都重度依赖元数据名称信息，
因此如果没有特殊处理，符号混淆后这些功能都会无法正常工作。

## 对Unity内置序列化功能的特殊支持

Obfuz与Unity工作流深度集成，会对Unity的序列化机制有一些特殊处理：

- 不会混淆MonoBehaviour、ScriptableObject及标注了`[Serialiable]`特性的类型的类型名、命名空间
- 不会混淆以上类型的参与序列化的字段，包括标注了`[SerializedField]`特性的私有字段
- 不会混淆以上类型的非static public属性，但public static及非public的属性仍然会被混淆
- 不会混淆标注了`[Serialiable]`特性的枚举类型的枚举项名
- 不会混淆MonoBehavior中`Awake`、`Start`之类的有特殊用途的事件函数

不过Obfuz没有处理场景对象上的`UnityEvent`字段，因此如果在`Inspector`中设置了`UnityEvent`类型字段的回调函数，需要禁用这些函数的符号混淆，
否则运行时将出现找不到回调函数的错误。

## 对Newtonsoft.Json等第三方序列化库的特殊支持

对需要序列化的类型添加`[Serializable]`特性有以下效果：

- 的类型名、命名空间、public非静态字段和public非静态成员属性不会被混淆。
- 枚举类型的枚举项名不会被混淆

这个默认设置已经
满足绝大多数情况。如果还要别的要求，需要对相关元数据禁用符号混淆。

## 禁用元数据的符号混淆

有几种方式：

1. [Obfuscation Pass](./obfuscation-pass)中配置对某些元数据禁用`Symbol Obfus` Pass。
2. [符号混淆](./symbol-obfuscation)的规则文件中配置对某些元数据禁用符号混淆。
3. 在代码中给需要禁用符号混淆的元数据上添加`[ObfuzIgnore]`特性， 文档[Obfuz CustomAttributes](./customattributes)。
