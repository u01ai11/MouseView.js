import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import EyeParticles from '../components/EyeParticles';



const features = [
  {
    title: 'Open Source',
    imageUrl: 'img/undraw_open_source.svg',
    description: (
      <>
        MouseView.js is a tool to generate attentional maps of websites and experiments. It is free to use and open source.
      </>
    ),
  },
  {
    title: 'Cross device compatibility',
    imageUrl: 'img/undraw_progressive_app.svg',
    description: (
      <>
        MouseView.js has support for touch-screen devices too. It works on static content and also dynamic content (like videos). 
      </>
    ),
  },
  {
    title: 'Implemented in existing tools',
    imageUrl: 'img/undraw_split_testing.svg',
    description: (
      <>
        MouseView.js has pre-made working examples in Gorilla.sc and jsPsych.
      </>
    ),
  },
];

const authors = [
    {
        name: 'Alex Anwyl-Irvine',
        imageUrl: 'img/alex.png',
        personalURL: 'https://www.irvine.science',
        bio: (
          <>
            Alex is a developmental cognitive neuroscientist with an interest in software development.
          </>
        ),
    },
    {
        name: 'Thomas Armstrong',
        imageUrl: 'img/tom.jpg',
        personalURL: 'http://www.peep-lab.org/',
        bio: (
          <>
            Tom is a Clinical psychologist studying disgust, emotion, and motivation with eyetracking. 
          </>
        ),
    },
    {
        name: 'Edwin Dalmaijer',
        imageUrl: 'img/edwin.jpg',
        personalURL: 'https://www.dalmaijer.org/',
        bio: (
          <>
            Edwin is a cognitive scientist who develops eye-tracking software, and researches how affect, cognition, and environment interact in child development.
          </>
        ),
    }
];

const collabs = [
    {
        name: 'Prof. Bunmi Olatuni',
        imageUrl: 'img/bunmi.png',
        personalURL: 'https://earlatvanderbilt.wordpress.com/',
        bio: (
          <>
            Emotion and Anxiety Research Laboratory - <b> Vanderbilt University </b>
          </>
        ),
    },
    {
        name: 'Prof. Samantha Dawson',
        imageUrl: 'img/samantha.png',
        personalURL: 'https://swelllab.psych.ubc.ca/person/samantha-dawson/',
        bio: (
          <>
            Sexuality and Well-being Lab - <b> University of British Columbia </b>
          </>
        ),
    },
    {
        name: 'Prof. Jeremy Stewart',
        imageUrl: 'img/jeremy.png',
        personalURL: 'https://www.querbylab.com/',
        bio: (
          <>
            Queen&apos;s Emotion and Risky Behaviour in Youth - <b> Queen&apos;s University </b>
         </>
        ),
    }
];


function Feature({imageUrl, title, description}) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx('col col--4', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Author({name, imageUrl, personalURL, bio}) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx('col col--4', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.authorImage} src={imgUrl} alt={name} />
        </div>
      )}
      <div className="text--center">
         <h4>{name}</h4>
         <a href={personalURL} target="_blank">website</a>
         <p>{bio}</p>
      </div>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Web eye tracking without the eyes <head />">
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
           
          <img className={styles.heroImage} src={siteConfig.customFields.heroLogo} alt={siteConfig.tagline} />
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={clsx(
                'button button--outline button--secondary button--lg',
                styles.buttons,
              )}
              to={useBaseUrl('docs/')}>
              Get Started
            </Link>
          </div>
        </div>
 <EyeParticles
                style={{
                    position: 'absolute',
                    pointerEvents: 'none',
                    width: '100%',
                    height: '100%',
                    left: 0,
                    top: 0
                }}
              />
      </header>
      <main>  
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
            <div className="text--center">
               <h1>Features</h1>
                <br></br>
             </div>
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            <hr></hr>
            </div>
          </section>
        )}

        <div className="container">
            <div className="text--center">
                <h1>MouseView.js in action</h1>
                <br></br>
                <img src='img/example.gif'></img>
            </div>
            <hr></hr>
        </div>

        <div className="container">
            <div className="text--center">
                <h1>Publications</h1>
<p>Read our paper published at Behavior Research Methods <a href='https://doi.org/10.3758/s13428-021-01703-5' target="_blank">here</a></p>
<p>If you use this tool please cite:</p>
                <code style ={{width: '70%'}}>Anwyl-Irvine, A. L., Armstrong, T., & Dalmaijer, E. S. (2021, September 29). 
                 MouseView.js: Reliable and valid attention tracking in web-based experiments using a cursor-directed aperture. <i>Behavior Research Methods</i>, https://doi.org/10.3758/s13428-021-01703-5 </code>
                
            </div>
            <hr></hr>
        </div>
{authors && authors.length > 0 && (
          <section className={styles.features}>
            <div className="container">
            <div className="text--center">
               <h1>Creators</h1>
                <br></br>
             </div>
              <div className="row">
                {authors.map((props, idx) => (
                  <Author key={idx} {...props} />
                ))}
              </div>
              <hr></hr>
            </div>
          </section>
        )}
{collabs && collabs.length > 0 && (
          <section className={styles.features}>
            <div className="container">
            <div className="text--center">
               <h1>Collaborators</h1>
               Early adopters running research using MouseView.js:
                <br></br>
             </div>
              <div className="row">
                {collabs.map((props, idx) => (
                  <Author key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}     
      </main>
    </Layout>
  );
}

export default Home;
