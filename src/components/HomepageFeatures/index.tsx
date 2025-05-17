import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import Translate, {translate} from '@docusaurus/Translate';

const texts = [
  {id:1, title:<Translate>开源免费</Translate>},
  {id:2, title:<Translate>基于 MIT 协议，免费使用和修改</Translate>},
  {id:3, title:<Translate>企业级保护</Translate>},
  {id:4, title:<Translate>提供媲美商业工具的强大混淆功能</Translate>},
  {id:5, title:<Translate>专为 Unity 设计</Translate>},
  {id:6, title:<Translate>深度集成 Unity 生态，简化开发流程</Translate>},

]

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList = [
  {
    title: texts[0].title,
    Svg: require('@site/static/img/efficient.svg').default,
    description: (
      <>
       {texts[1].title}
      </>
    ),
  },
  {
    title: texts[2].title,
    Svg: require('@site/static/img/reliable-dark.svg').default,
    description: (
      <>
        {texts[3].title}
      </>
    ),
  },
  {
    title: texts[4].title,
    Svg: require('@site/static/img/easy.svg').default,
    description: (
      <>
        {texts[5].title}
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
