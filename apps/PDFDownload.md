 PDF下载要求
 1、所有页面禁止浏览器打印功能
 2、点击 Download PDF 按钮时，弹出付费弹窗，用户付费后才真实的调用下载接口进行下载
 3、付费记录设计成一个订单表，每次发起付费都生成一个订单记录付费记录
 4、付费只需要付6.8元人民币，付完费之后只允许当前用户下载同一个简历9次，超过9次需重新付费
 5、支付采用微信支付实现，具体为使用nativce方式实现微信支付，参考https://pay.weixin.qq.com/doc/v3/merchant/4012791874、https://pay.weixin.qq.com/doc/v3/merchant/4015614538、https://pay.weixin.qq.com/doc/v3/merchant/4012791891
 6、采用nodejs框架https://www.npmjs.com/package/wechatpay-node-v3实现，参考native方式实现 https://github.com/klover2/wechatpay-node-v3-ts/blob/master/docs/transactions_native.md
 