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

          @media (max-width: 768px) {
            .flex-row,
            .flex-row-reverse {
              flex-direction: column !important;
            }
            .flex-content,
            .flex-image {
              flex: 0 0 100% !important;
            }
          }
        `}</style>
      </Head>
      <body>
        <div
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

          <div
            style={{
              marginBottom: '3rem',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              padding: '1rem',
              borderRadius: '10px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'stretch',
            }}
          >
            <div
              className="flex-content"
              style={{
                flex: '0 0 60%',
                padding: '10px',
              }}
            >
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
            <div
              className="flex-image"
              style={{
                flex: '0 0 40%',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
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

          <div
            style={{
              marginBottom: '3rem',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              padding: '1rem',
              borderRadius: '10px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'row-reverse',
              alignItems: 'stretch',
            }}
          >
            <div
              className="flex-content"
              style={{
                flex: '0 0 60%',
                padding: '10px',
              }}
            >
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
            <div
              className="flex-image"
              style={{
                flex: '0 0 40%',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
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

          <div
            style={{
              marginBottom: '3rem',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              padding: '1rem',
              borderRadius: '10px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'stretch',
            }}
          >
            <div
              className="flex-content"
              style={{
                flex: '0 0 60%',
                padding: '10px',
              }}
            >
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
            <div
              className="flex-image"
              style={{
                flex: '0 0 40%',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
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
