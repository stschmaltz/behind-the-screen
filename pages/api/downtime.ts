import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set the content type to HTML
  res.setHeader('Content-Type', 'text/html');

  // Return the HTML content
  res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ghosts of Saltmarsh Downtime Activities</title>
  <meta name="description" content="Downtime activities for Ghosts of Saltmarsh campaign">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Georgia, serif;
      background-color: #f5f0e6;
      background-image: url('https://www.transparenttextures.com/patterns/aged-paper.png');
      color: #3e2c1c;
    }

    .main-container {
      padding: 3rem;
      max-width: 900px;
      margin: auto;
      border: 10px solid #5a2c0c;
      border-radius: 12px;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
      background-color: #f5f0e6;
      background-image: url('https://www.transparenttextures.com/patterns/aged-paper.png');
    }

    h1 {
      font-family: 'Times New Roman', serif;
      color: #4b1d06;
      text-shadow: 1px 1px #d8c8b0;
      border-bottom: 3px double #5a2c0c;
      padding-bottom: 0.5rem;
      margin-bottom: 2rem;
      font-size: 2.5rem;
      text-align: center;
      position: relative;
    }

    h2 {
      margin-top: 0;
      font-size: 1.8rem;
      border-bottom: 2px solid #5a2c0c;
      padding-bottom: 0.3rem;
      font-family: 'Times New Roman', serif;
      color: #4b1d06;
    }

    ul {
      margin-left: 1rem;
      padding-left: 1rem;
      list-style-type: square;
    }

    li {
      margin-bottom: 0.75rem;
    }

    li strong {
      color: #7a3a0c;
    }

    p {
      font-size: 1.1rem;
      line-height: 1.6;
      margin-top: 1rem;
    }

    .footer-text {
      text-align: center;
      font-style: italic;
      margin-top: 2rem;
      font-size: 0.9rem;
      color: #5a2c0c;
    }

    /* Layout components */
    .content-section {
      display: flex;
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
    }

    /* Mobile styles */
    @media (max-width: 768px) {
      .content-section {
        display: block;
        padding: 0.75rem;
        margin-bottom: 2rem;
      }

      .flex-content,
      .flex-image {
        flex: none;
        width: 100%;
        padding: 0;
        margin: 0;
        display: block;
      }

      .flex-image {
        margin-top: 1.5rem;
        align-items: initial;
        justify-content: initial;
      }

      .flex-image img {
        padding: 0.4rem;
        border-width: 2px;
        margin: 0 auto;
      }

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

    /* Smaller mobile */
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
  </style>
</head>
<body>
  <div class="main-container">
    <h1>Ghosts of Saltmarsh: Downtime Activities</h1>

    <div class="content-section flex-row">
      <div class="flex-content">
        <h2>Saltmarsh-Specific Activities</h2>
        <ul>
          <li><strong>Carousing</strong> (2d10 gp): Make a local contact. Choose a tavern based on the crowd you want to mingle with.</li>
          <li><strong>Research (Local Lore)</strong>: Help Krag, earn 7 gp, and learn a true regional fact.</li>
          <li><strong>Employment</strong>: Pick a town job. Earn 7 gp. On a good Charisma roll (DC 15), meet a town leader.</li>
          <li><strong>Mercenary Work</strong>: Guard duty. Earn 7 gp + 2d10 gp. On a d20 roll of 19+, earn 3d20 gp extra.</li>
          <li><strong>Buy/Sell Magical Items</strong>:<br>
            - Buy: 50 gp retainer to view inventory. Prices vary by rarity. Special orders take 1d4 weeks.<br>
            - Sell: Get half value. Takes 1 week.
          </li>
        </ul>
      </div>
      <div class="flex-image">
        <img src="/images/downtime/image2.png" alt="Tavern Carousing">
      </div>
    </div>

    <div class="content-section flex-row-reverse">
      <div class="flex-content">
        <h2>General Activities</h2>
        <ul>
          <li><strong>Crafting</strong>: Spend half item cost in materials. Craft 5 gp/day.</li>
          <li><strong>Practice a Profession</strong>: Work a trade. Earn 7 gp/week.</li>
          <li><strong>Recuperate</strong>: Rest for 3+ days. Make 2 saves against a long-term effect.</li>
          <li><strong>Training</strong>: Learn a new tool/language. Takes 10 weeks. 25 gp/week.</li>
          <li><strong>Gambling</strong>: Bet gold, roll checks, win or lose.</li>
          <li><strong>Pit Fighting</strong>: Athletic arena combat. Earn up to 25 gp/week.</li>
          <li><strong>Crime</strong>: Risky jobs. Pay 25 gp. Possible high reward or arrest.</li>
          <li><strong>Religious Service</strong>: Serve a temple. Gain favors based on rolls.</li>
          <li><strong>Research (General)</strong>: Pay 50 gp/week to learn lore on a subject.</li>
          <li><strong>Hire a Spellcaster</strong>: Pay for magical services (10–180 gp based on spell level).</li>
        </ul>
      </div>
      <div class="flex-image">
        <img src="/images/downtime/image1.png" alt="Guard Duty at Docks">
      </div>
    </div>

    <div class="content-section flex-row">
      <div class="flex-content">
        <h2>Leisure and Other Pursuits</h2>
        <p>
          Whether you're seeking knowledge, training, fortune, or connection, Saltmarsh offers many ways to spend your downtime meaningfully. Choose wisely, for each choice shapes the tales you carry forward.
        </p>
        <p>
          Remember that your actions during downtime can lead to unexpected adventures. A careless night of carousing might turn into a secret meeting with a suspicious merchant. A religious service could reveal ancient lore of the deep.
        </p>
        <p>
          Saltmarsh holds many secrets in its mist-shrouded streets and along its wave-battered docks. Use your time between adventures to uncover them.
        </p>
      </div>
      <div class="flex-image">
        <img src="/images/downtime/image3.png" alt="Crafting and Research">
      </div>
    </div>

    <div class="footer-text">
      ❖ For the adventurers of Saltmarsh ❖
    </div>
  </div>
</body>
</html>
  `);
}
