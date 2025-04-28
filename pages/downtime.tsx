import { NextPage } from 'next';
import Head from 'next/head';
import type { ReactElement, ReactNode } from 'react';
import { GetServerSideProps } from 'next';

// Define our custom page type with layout
type CustomNextPage = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

// This ensures the page is rendered without any default app layout
const DowntimePage: CustomNextPage = () => {
  return (
    <html lang="en">
      <Head>
        <title>Ghosts of Saltmarsh Downtime Activities</title>
        <meta
          name="description"
          content="Downtime activities for Ghosts of Saltmarsh campaign"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style jsx global>{`
          body {
            margin: 0;
            padding: 0;
            font-family: Georgia, serif;
            background-color: #f5f0e6;
            background-image: url('https://www.transparenttextures.com/patterns/aged-paper.png');
          }

          /* --- Desktop First Styles --- */
          .content-section {
            display: flex; /* Default: Flexbox for side-by-side */
            align-items: stretch;
            margin-bottom: 3rem;
            background-color: rgba(255, 255, 255, 0.8);
            padding: 1rem;
            border-radius: 10px;
            position: relative;
            overflow: hidden;
          }

          .flex-row {
            flex-direction: row;
          }

          .flex-row-reverse {
            flex-direction: row-reverse;
          }

          .flex-content {
            flex: 1 1 60%;
            padding: 10px;
          }

          .flex-image {
            flex: 1 1 40%;
            padding: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .flex-image img {
            width: 100%;
            height: auto;
            border: 3px solid #5a2c0c;
            border-radius: 10px;
            background: #fff;
            padding: 0.75rem;
            box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
            object-fit: cover;
            max-width: 100%;
          }

          /* --- Mobile Overrides --- */
          @media (max-width: 768px) {
            .content-section {
              display: block; /* Override to block for stacking */
              padding: 0.75rem;
              margin-bottom: 2rem;
            }

            /* Reset flex properties for children on mobile */
            .flex-content,
            .flex-image {
              flex: none; /* Remove flex behavior */
              width: 100%; /* Take full width */
              padding: 0; /* Adjust padding for stacked layout */
              margin: 0;
              /* Keep display as default (block-like for divs) */
              display: block;
            }

            .flex-image {
              margin-top: 1.5rem; /* Space between stacked items */
              /* No longer need display: flex for centering on mobile */
              align-items: initial;
              justify-content: initial;
            }

            .flex-image img {
              padding: 0.4rem;
              border-width: 2px;
              margin: 0 auto; /* Center image within its block */
            }

            /* Other mobile styles (fonts, containers, etc.) */
            h1 {
              font-size: 1.8rem;
              padding: 0.5rem;
              margin-bottom: 1rem;
            }

            h2 {
              font-size: 1.5rem;
            }

            body p,
            body li {
              font-size: 1rem;
            }

            .main-container {
              padding: 1rem;
              border-width: 5px;
            }

            li {
              margin-bottom: 1rem;
              padding-left: 0;
            }

            ul {
              padding-left: 1.2rem;
              margin-left: 0;
            }
          }

          /* Smaller mobile adjustments */
          @media (max-width: 480px) {
            h1 {
              font-size: 1.5rem;
              border-bottom-width: 2px;
            }

            h2 {
              font-size: 1.3rem;
              border-bottom-width: 1px;
              margin-top: 0.5rem;
              padding-bottom: 0.2rem;
            }

            .main-container {
              padding: 0.75rem;
              border-width: 3px;
            }

            .content-section {
              padding: 0.5rem;
              margin-bottom: 1rem;
            }

            p {
              margin-top: 0.5rem;
              line-height: 1.4;
            }

            .flex-image {
              margin-top: 1rem;
            }

            .footer-text {
              margin-top: 1rem;
            }
          }
        `}</style>
      </Head>
      <body>
        <div
          className="main-container"
          style={{
            fontFamily: 'Georgia, serif',
            backgroundColor: '#f5f0e6',
            backgroundImage:
              'url("https://www.transparenttextures.com/patterns/aged-paper.png")',
            color: '#3e2c1c',
            padding: '3rem',
            maxWidth: '900px',
            margin: 'auto',
            border: '10px solid #5a2c0c',
            borderRadius: '12px',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          <h1
            style={{
              fontFamily: 'Times New Roman, serif',
              color: '#4b1d06',
              textShadow: '1px 1px #d8c8b0',
              borderBottom: '3px double #5a2c0c',
              paddingBottom: '0.5rem',
              marginBottom: '2rem',
              fontSize: '2.5rem',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            Ghosts of Saltmarsh: Downtime Activities
          </h1>

          <div className="content-section flex-row">
            <div className="flex-content">
              <h2
                style={{
                  marginTop: 0,
                  fontSize: '1.8rem',
                  borderBottom: '2px solid #5a2c0c',
                  paddingBottom: '0.3rem',
                  fontFamily: 'Times New Roman, serif',
                  color: '#4b1d06',
                }}
              >
                Saltmarsh-Specific Activities
              </h2>
              <ul
                style={{
                  marginLeft: '1rem',
                  paddingLeft: '1rem',
                  listStyleType: 'square',
                }}
              >
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#7a3a0c' }}>Carousing</strong> (2d10
                  gp): Make a local contact. Choose a tavern based on the crowd
                  you want to mingle with.
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#7a3a0c' }}>
                    Research (Local Lore)
                  </strong>
                  : Help Krag, earn 7 gp, and learn a true regional fact.
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#7a3a0c' }}>Employment</strong>: Pick
                  a town job. Earn 7 gp. On a good Charisma roll (DC 15), meet a
                  town leader.
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#7a3a0c' }}>Mercenary Work</strong>:
                  Guard duty. Earn 7 gp + 2d10 gp. On a d20 roll of 19+, earn
                  3d20 gp extra.
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#7a3a0c' }}>
                    Buy/Sell Magical Items
                  </strong>
                  :<br />
                  - Buy: 50 gp retainer to view inventory. Prices vary by
                  rarity. Special orders take 1d4 weeks.
                  <br />- Sell: Get half value. Takes 1 week.
                </li>
              </ul>
            </div>
            <div className="flex-image">
              <img
                src="/images/downtime/image2.png"
                alt="Tavern Carousing"
                style={{
                  width: '100%',
                  height: 'auto',
                  border: '3px solid #5a2c0c',
                  borderRadius: '10px',
                  background: '#fff',
                  padding: '0.75rem',
                  boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.2)',
                  objectFit: 'cover',
                }}
              />
            </div>
          </div>

          <div className="content-section flex-row-reverse">
            <div className="flex-content">
              <h2
                style={{
                  marginTop: 0,
                  fontSize: '1.8rem',
                  borderBottom: '2px solid #5a2c0c',
                  paddingBottom: '0.3rem',
                  fontFamily: 'Times New Roman, serif',
                  color: '#4b1d06',
                }}
              >
                General Activities
              </h2>
              <ul
                style={{
                  marginLeft: '1rem',
                  paddingLeft: '1rem',
                  listStyleType: 'square',
                }}
              >
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#7a3a0c' }}>Crafting</strong>: Spend
                  half item cost in materials. Craft 5 gp/day.
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#7a3a0c' }}>
                    Practice a Profession
                  </strong>
                  : Work a trade. Earn 7 gp/week.
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#7a3a0c' }}>Recuperate</strong>: Rest
                  for 3+ days. Make 2 saves against a long-term effect.
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#7a3a0c' }}>Training</strong>: Learn
                  a new tool/language. Takes 10 weeks. 25 gp/week.
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#7a3a0c' }}>Gambling</strong>: Bet
                  gold, roll checks, win or lose.
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#7a3a0c' }}>Pit Fighting</strong>:
                  Athletic arena combat. Earn up to 25 gp/week.
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#7a3a0c' }}>Crime</strong>: Risky
                  jobs. Pay 25 gp. Possible high reward or arrest.
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#7a3a0c' }}>
                    Religious Service
                  </strong>
                  : Serve a temple. Gain favors based on rolls.
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#7a3a0c' }}>
                    Research (General)
                  </strong>
                  : Pay 50 gp/week to learn lore on a subject.
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#7a3a0c' }}>
                    Hire a Spellcaster
                  </strong>
                  : Pay for magical services (10–180 gp based on spell level).
                </li>
              </ul>
            </div>
            <div className="flex-image">
              <img
                src="/images/downtime/image1.png"
                alt="Guard Duty at Docks"
                style={{
                  width: '100%',
                  height: 'auto',
                  border: '3px solid #5a2c0c',
                  borderRadius: '10px',
                  background: '#fff',
                  padding: '0.75rem',
                  boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.2)',
                  objectFit: 'cover',
                }}
              />
            </div>
          </div>

          <div className="content-section flex-row">
            <div className="flex-content">
              <h2
                style={{
                  marginTop: 0,
                  fontSize: '1.8rem',
                  borderBottom: '2px solid #5a2c0c',
                  paddingBottom: '0.3rem',
                  fontFamily: 'Times New Roman, serif',
                  color: '#4b1d06',
                }}
              >
                Leisure and Other Pursuits
              </h2>
              <p
                style={{
                  fontSize: '1.1rem',
                  lineHeight: 1.6,
                  marginTop: '1rem',
                }}
              >
                Whether you&#39;re seeking knowledge, training, fortune, or
                connection, Saltmarsh offers many ways to spend your downtime
                meaningfully. Choose wisely, for each choice shapes the tales
                you carry forward.
              </p>
              <p
                style={{
                  fontSize: '1.1rem',
                  lineHeight: 1.6,
                  marginTop: '1rem',
                }}
              >
                Remember that your actions during downtime can lead to
                unexpected adventures. A careless night of carousing might turn
                into a secret meeting with a suspicious merchant. A religious
                service could reveal ancient lore of the deep.
              </p>
              <p
                style={{
                  fontSize: '1.1rem',
                  lineHeight: 1.6,
                  marginTop: '1rem',
                }}
              >
                Saltmarsh holds many secrets in its mist-shrouded streets and
                along its wave-battered docks. Use your time between adventures
                to uncover them.
              </p>
            </div>
            <div className="flex-image">
              <img
                src="/images/downtime/image3.png"
                alt="Crafting and Research"
                style={{
                  width: '100%',
                  height: 'auto',
                  border: '3px solid #5a2c0c',
                  borderRadius: '10px',
                  background: '#fff',
                  padding: '0.75rem',
                  boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.2)',
                  objectFit: 'cover',
                }}
              />
            </div>
          </div>

          <div
            style={{
              textAlign: 'center',
              fontStyle: 'italic',
              marginTop: '2rem',
              fontSize: '0.9rem',
              color: '#5a2c0c',
            }}
            className="footer-text"
          >
            ❖ For the adventurers of Saltmarsh ❖
          </div>
        </div>
      </body>
    </html>
  );
};

// This prevents the default layout from being applied
DowntimePage.getLayout = function getLayout(page: ReactElement) {
  return page;
};

// This makes the page public by bypassing authentication checks
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {}, // No props needed for this standalone page
  };
};

export default DowntimePage;
