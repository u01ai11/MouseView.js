import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import Particles from 'react-particles-js';



const features = [
  {
    title: 'Open Source',
    imageUrl: 'img/undraw_open_source.svg',
    description: (
      <>
        MouseView.js is free to use and open source.
      </>
    ),
  },
  {
    title: 'Cross device compatibility',
    imageUrl: 'img/undraw_progressive_app.svg',
    description: (
      <>
        Despite its name MouseView.js has support for touch-screen devices too.
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
            Tom is a Clinical psychologist studying disgust, emotion, motivation with eyetracking. 
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
            Emotion and Anxiety Research Laboratory - Vanderbilt University
          </>
        ),
    },
    {
        name: 'Prof. Samantha Dawson',
        imageUrl: 'img/samantha.png',
        personalURL: 'https://swelllab.psych.ubc.ca/person/samantha-dawson/',
        bio: (
          <>
            Sexuality and Well-being Lab - University of British Columbia 
          </>
        ),
    },
    {
        name: 'Prof. Jeremy Stewart',
        imageUrl: 'img/jeremy.png',
        personalURL: 'https://www.querbylab.com/',
        bio: (
          <>
            Queens Emotion and Risky Behaviour in Yourh - Queens University, Belfast
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
 <Particles
                params={{
                   "particles":{"number":{"value":350,"density":{"enable":true,"value_area":1000.8066982851817}},"color":{"value":"#ffffff"},"shape":{"type":"image","stroke":{"width":0,"color":"#000000"},"polygon":{"nb_sides":5},"image":{"src":"img/eye.png","width":100,"height":100}},"opacity":{"value":0.5,"random":false,"anim":{"enable":false,"speed":1,"opacity_min":0.1,"sync":false}},"size":{"value":3,"random":true,"anim":{"enable":false,"speed":40,"size_min":0.1,"sync":false}},"line_linked":{"enable":true,"distance":75,"color":"#ffffff","opacity":0.4,"width":1},"move":{"enable":true,"speed":2,"direction":"none","random":true,"straight":false,"out_mode":"out","bounce":false,"attract":{"enable":false,"rotateX":600,"rotateY":1200}}},"interactivity":{"detect_on":"canvas","events":{"onhover":{"enable":true,"mode":"bubble"},"onclick":{"enable":false,"mode":"push"},"resize":true},"modes":{"grab":{"distance":400,"line_linked":{"opacity":1}},"bubble":{"distance":100.7842157842158,"size":9.988011988011989,"duration":4.155844155844156,"opacity":8,"speed":3},"repulse":{"distance":200,"duration":0.4},"push":{"particles_nb":4},"remove":{"particles_nb":2}}},"retina_detect":true
                }} 
                style={{
                    position: 'absolute',
                    pointerEvents: 'none',
                    width: '100%', 
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    left: 0, 
                    right: 0,
                    top: 0,
                    bottom: 0
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
<p>Read our preprint on PsyArXiv <a href='https://doi.org/10.31234/osf.io/rsdwg' target="_blank">here</a></p>
<p>If you use this tool please cite:</p>
                <code style ={{width: '70%'}}>Anwyl-Irvine, A. L., Armstrong, T., & Dalmaijer, E. S. (2021, March 7). 
                 MouseView.js: Reliable and valid attention tracking in web-based experiments using a cursor-directed aperture. https://doi.org/10.31234/osf.io/rsdwg </code>
                
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
            </div>
          </section>
        )}
{collabs && collabs.length > 0 && (
          <section className={styles.features}>
            <div className="container">
            <div className="text--center">
               <h1>Collaborators</h1>
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
