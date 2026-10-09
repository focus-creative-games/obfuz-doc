# 垃圾代码生成

垃圾代码生成可以降低App与其他App的二进制代码相似度，用于对抗App应用商店的应该相似度审核。

## 垃圾代码策略

目前有以下几种垃圾代码策略：

- 单独生成大量的消息、配置、UI相关垃圾代码
- 正常代码中注入大量垃圾指令

## 设置

`ObfuzSettings.GarbageCodeGenerationSettings`中包含垃圾代码相关设置，详细见文档[设置](./configuration)。

## 垃圾代码类别

目前支持以下几类垃圾代码的生成：

- Config 生成仿[Luban](https://github.com/focus-creative-games/luban)风格的配置加载代码。
- UI 生成基于UGUI的UI绑定代码。

将来可能会支持的垃圾代码类别：

- Protobol 协议代码
- Controller 控制器代码

## 垃圾代码混淆

将垃圾代码生成到混淆程序中即可实现垃圾代码混淆。混淆后的垃圾代码可以进一步提升代码复杂度，减少代码相似度。
