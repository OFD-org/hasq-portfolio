import { works } from './data/works.js';
import { workTitles } from './data/work-titles.js';
import { WorkSlider } from './components/work-slider.js';

const section = document.querySelector('#works');
if (section) new WorkSlider(section, works.map(work => ({ ...work, title: workTitles[work.id] || work.title })));
