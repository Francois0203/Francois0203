import React from 'react';
import '../../../src/styles/Theme.css';
import '../../../src/styles/Components.css';

export default {
  title: 'General/Component Styles',
  parameters: {
    docs: {
      description: {
        component: 'Demonstrates the styling of various HTML elements using Components.css.',
      },
    },
  },
};

const Template = () => (
  <div style={{ padding: '20px', maxWidth: '800px' }}>
    <h1>Typography</h1>
    <h1>H1 Heading</h1>
    <h2>H2 Heading</h2>
    <h3>H3 Heading</h3>
    <h4>H4 Heading</h4>
    <p>This is a paragraph with some <strong>bold text</strong> and <em>italic text</em>.</p>
    <a href="#">This is a link</a>

    <h1>Buttons</h1>
    <button type="button">Default Button</button>
    <button type="submit">Submit Button</button>
    <button type="reset">Reset Button</button>
    <button disabled>Disabled Button</button>

    <h1>Form Elements</h1>
    <div style={{ marginBottom: '10px' }}>
      <label>Text Input:</label>
      <input type="text" placeholder="Enter text" />
    </div>
    <div style={{ marginBottom: '10px' }}>
      <label>Password Input:</label>
      <input type="password" placeholder="Enter password" />
    </div>
    <div style={{ marginBottom: '10px' }}>
      <label>Email Input:</label>
      <input type="email" placeholder="Enter email" />
    </div>
    <div style={{ marginBottom: '10px' }}>
      <label>Number Input:</label>
      <input type="number" placeholder="Enter number" />
    </div>
    <div style={{ marginBottom: '10px' }}>
      <label>Search Input:</label>
      <input type="search" placeholder="Search" />
    </div>
    <div style={{ marginBottom: '10px' }}>
      <label>Tel Input:</label>
      <input type="tel" placeholder="Enter phone" />
    </div>
    <div style={{ marginBottom: '10px' }}>
      <label>URL Input:</label>
      <input type="url" placeholder="Enter URL" />
    </div>
    <div style={{ marginBottom: '10px' }}>
      <label>Date Input:</label>
      <input type="date" />
    </div>
    <div style={{ marginBottom: '10px' }}>
      <label>Time Input:</label>
      <input type="time" />
    </div>
    <div style={{ marginBottom: '10px' }}>
      <label>Datetime-Local Input:</label>
      <input type="datetime-local" />
    </div>
    <div style={{ marginBottom: '10px' }}>
      <label>Month Input:</label>
      <input type="month" />
    </div>
    <div style={{ marginBottom: '10px' }}>
      <label>Week Input:</label>
      <input type="week" />
    </div>
    <div style={{ marginBottom: '10px' }}>
      <label>File Input:</label>
      <input type="file" />
    </div>
    <div style={{ marginBottom: '10px' }}>
      <label>Range Slider:</label>
      <input type="range" min="0" max="100" />
    </div>
    <div style={{ marginBottom: '10px' }}>
      <label>Textarea:</label>
      <textarea placeholder="Enter text"></textarea>
    </div>
    <div style={{ marginBottom: '10px' }}>
      <label>Select:</label>
      <select>
        <option value="">Choose an option</option>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </select>
    </div>
    <div style={{ marginBottom: '10px' }}>
      <label>
        <input type="checkbox" /> Checkbox Label
      </label>
    </div>
    <div style={{ marginBottom: '10px' }}>
      <label>
        <input type="radio" name="radio" value="1" /> Radio 1
      </label>
      <label>
        <input type="radio" name="radio" value="2" /> Radio 2
      </label>
    </div>
    <div style={{ marginBottom: '10px' }}>
      <label>Meter:</label>
      <meter value="0.6" min="0" max="1">60%</meter>
    </div>
    <div style={{ marginBottom: '10px' }}>
      <label>Progress:</label>
      <progress value="70" max="100">70%</progress>
    </div>

    <h1>Other Elements</h1>
    <hr />
    <code>Inline code</code>
    <pre><code>Preformatted code block</code></pre>
    <blockquote>This is a blockquote</blockquote>
    <mark>Highlighted text</mark>
    <kbd>Ctrl + C</kbd>
    <abbr title="HyperText Markup Language">HTML</abbr>

    <details>
      <summary>Details Summary</summary>
      <p>Details content</p>
    </details>

    <table>
      <thead>
        <tr>
          <th>Header 1</th>
          <th>Header 2</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Data 1</td>
          <td>Data 2</td>
        </tr>
        <tr>
          <td>Data 3</td>
          <td>Data 4</td>
        </tr>
      </tbody>
    </table>

    <fieldset>
      <legend>Fieldset Legend</legend>
      <p>Fieldset content</p>
    </fieldset>

    <output>Output element</output>
  </div>
);

export const Default = Template.bind({});
Default.args = {};
