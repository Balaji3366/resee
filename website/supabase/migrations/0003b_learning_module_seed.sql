-- NOTE: Run manually in the Supabase Dashboard SQL editor, AFTER
-- 0003_learning_module.sql. Seed content only — safe to re-run is NOT
-- guaranteed (no ON CONFLICT DO NOTHING on the content tables), so only
-- run this once against a given project.

do $body$
declare
  cat_programming uuid;
  cat_testing uuid;
  cat_cloud uuid;
  cat_ai uuid;
  cat_soft_skills uuid;
  cat_gov_exams uuid;
  cat_career_skills uuid;

  course_fullstack uuid;
  mod1 uuid;
  mod2 uuid;
  lesson_html uuid;
  lesson_css uuid;
  lesson_js uuid;
  quiz1 uuid;
  lesson_react uuid;
  lesson_hooks uuid;
  lesson_api uuid;
  quiz2 uuid;
begin

  -- ============================================================
  -- Categories
  -- ============================================================
  insert into public.learning_categories (slug, name, icon, sort_order) values
    ('programming', 'Programming', '💻', 1)
    returning id into cat_programming;

  insert into public.learning_categories (slug, name, icon, sort_order) values
    ('testing', 'Testing', '🧪', 2)
    returning id into cat_testing;

  insert into public.learning_categories (slug, name, icon, sort_order) values
    ('cloud', 'Cloud', '☁️', 3)
    returning id into cat_cloud;

  insert into public.learning_categories (slug, name, icon, sort_order) values
    ('ai', 'AI', '🧠', 4)
    returning id into cat_ai;

  insert into public.learning_categories (slug, name, icon, sort_order) values
    ('soft-skills', 'Soft Skills', '🗣️', 5)
    returning id into cat_soft_skills;

  insert into public.learning_categories (slug, name, icon, sort_order) values
    ('government-exams', 'Government Exams', '🏛️', 6)
    returning id into cat_gov_exams;

  insert into public.learning_categories (slug, name, icon, sort_order) values
    ('career-skills', 'Career Skills', '💼', 7)
    returning id into cat_career_skills;

  -- ============================================================
  -- Courses
  -- ============================================================
  insert into public.courses (slug, category_id, title, tagline, description, difficulty, icon, is_available, sort_order)
  values (
    'full-stack-development',
    cat_programming,
    'Full Stack Development',
    'Go from zero to shipping real web apps.',
    'Learn to build complete web applications from the ground up — semantic HTML, modern CSS layout, JavaScript fundamentals, and React with real API integration.',
    'beginner',
    '🚀',
    true,
    1
  )
  returning id into course_fullstack;

  insert into public.courses (slug, category_id, title, tagline, description, difficulty, icon, is_available, sort_order) values
    ('qa-automation', cat_testing, 'QA Automation', 'Test software like a pro.', 'Learn manual and automated testing fundamentals, from writing test cases to building automated test suites.', 'beginner', '🧪', false, 2),
    ('data-analytics', cat_ai, 'Data Analytics', 'Turn raw data into real decisions.', 'Learn to clean, analyse, and visualise data to answer real business questions.', 'beginner', '📊', false, 3),
    ('ai-engineering', cat_ai, 'AI Engineering', 'Build and ship AI-powered products.', 'Learn to design, build, and deploy AI-powered features in real applications.', 'intermediate', '🤖', false, 4),
    ('devops', cat_cloud, 'DevOps', 'Automate, deploy, and scale with confidence.', 'Learn CI/CD, containerisation, and cloud infrastructure fundamentals.', 'intermediate', '⚙️', false, 5),
    ('ui-ux-design', cat_career_skills, 'UI/UX Design', 'Design products people love to use.', 'Learn user research, wireframing, and modern interface design principles.', 'beginner', '🎨', false, 6),
    ('government-exam-prep', cat_gov_exams, 'Government Exams', 'Structured prep for competitive exams.', 'A structured, disciplined path for competitive government exam preparation.', 'beginner', '🏛️', false, 7);

  -- ============================================================
  -- Module 1: Frontend Foundations
  -- ============================================================
  insert into public.course_modules (course_id, title, description, sort_order)
  values (course_fullstack, 'Frontend Foundations', 'The building blocks of every web page: HTML, CSS and JavaScript.', 1)
  returning id into mod1;

  insert into public.lessons (module_id, course_id, slug, title, content, key_takeaways, estimated_minutes, sort_order)
  values (
    mod1, course_fullstack, 'semantic-html', 'Semantic HTML & Document Structure',
$$## Why semantic HTML matters

Semantic HTML means using elements that describe *what* content is, not just how it looks. Instead of wrapping everything in `<div>`, you reach for elements like `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, and `<footer>`.

```html
<header>
  <h1>My Site</h1>
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
  </nav>
</header>

<main>
  <article>
    <h2>Blog Post Title</h2>
    <p>Content goes here...</p>
  </article>
</main>

<footer>
  <p>&copy; 2026</p>
</footer>
```

## Why it's worth doing properly

- **Accessibility** — screen readers use landmark elements (`<nav>`, `<main>`, `<header>`) to let users jump straight to the part of the page they care about, instead of reading every `<div>` top to bottom.
- **SEO** — search engines weigh a properly structured `<article>` or `<h1>` more heavily than the same text in a generic `<div>`.
- **Maintainability** — six months from now, `<nav>` tells you exactly what that block is; `<div class="top-bar-2">` does not.

A simple rule of thumb: reach for a semantic element first, and only fall back to `<div>`/`<span>` when nothing more specific fits.
$$,
    array[
      'Semantic tags describe meaning, not just appearance',
      'Screen readers rely on landmark elements to navigate a page efficiently',
      'Search engines and future-you both benefit from a properly structured document'
    ],
    8, 1
  )
  returning id into lesson_html;

  insert into public.lessons (module_id, course_id, slug, title, content, key_takeaways, estimated_minutes, sort_order)
  values (
    mod1, course_fullstack, 'css-flexbox-grid', 'CSS Layout with Flexbox & Grid',
$$## Two layout tools, two different jobs

**Flexbox** is one-dimensional — great for laying items out in a row or a column, like a navbar or a button group.

```css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

**Grid** is two-dimensional — great when you need to control rows *and* columns at once, like a page layout or a card gallery.

```css
.page-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 1.5rem;
}
```

## A simple rule of thumb

If you're arranging things in a single line, reach for Flexbox. If you're arranging a whole layout with rows *and* columns, reach for Grid. Most real interfaces use both together — Grid for the overall page skeleton, Flexbox for the smaller components inside it.
$$,
    array[
      'Flexbox excels at one-dimensional layouts (a row or a column)',
      'Grid excels at two-dimensional layouts (rows and columns together)',
      'Most real UIs combine both: Grid for the page skeleton, Flexbox for components inside it'
    ],
    10, 2
  )
  returning id into lesson_css;

  insert into public.lessons (module_id, course_id, slug, title, content, key_takeaways, estimated_minutes, sort_order)
  values (
    mod1, course_fullstack, 'javascript-fundamentals', 'JavaScript Fundamentals',
$$## Variables and scope

```js
let count = 0;      // can be reassigned
const name = "Ada";  // cannot be reassigned
```

Prefer `const` by default, and only use `let` when a value genuinely needs to change. Avoid `var` — it doesn't respect block scope the way `let`/`const` do, which leads to subtle bugs.

## Functions

```js
function double(n) {
  return n * 2;
}

const triple = (n) => n * 3;
```

## Array methods you'll use constantly

```js
const numbers = [1, 2, 3, 4, 5];

const doubled = numbers.map((n) => n * 2);        // [2, 4, 6, 8, 10]
const evens = numbers.filter((n) => n % 2 === 0);  // [2, 4]
const total = numbers.reduce((sum, n) => sum + n, 0); // 15
```

`map` transforms every item, `filter` keeps only the items that pass a test, and `reduce` combines everything into a single value. Together they cover the vast majority of everyday array work — far more readable than a manual `for` loop once you're used to them.
$$,
    array[
      'Prefer const over let, and avoid var entirely',
      'Arrow functions are a shorter syntax for writing functions',
      'map, filter and reduce cover most everyday array transformations'
    ],
    12, 3
  )
  returning id into lesson_js;

  insert into public.quizzes (module_id, course_id, slug, title, passing_score, estimated_minutes)
  values (mod1, course_fullstack, 'module-1-quiz', 'Frontend Foundations Quiz', 70, 6)
  returning id into quiz1;

  insert into public.quiz_questions (quiz_id, question, question_type, options, correct_option_ids, explanation, sort_order) values
  (quiz1, 'Which element is the correct semantic landmark for a page''s primary navigation?',
    'single_choice',
    '[{"id":"a","text":"<div class=\"nav\">"},{"id":"b","text":"<nav>"},{"id":"c","text":"<header>"},{"id":"d","text":"<section>"}]',
    '["b"]',
    '<nav> is the dedicated landmark element for navigation links, letting screen readers and browsers identify it directly.',
    1),
  (quiz1, 'Which CSS layout model is best suited to a single row of navbar items?',
    'single_choice',
    '[{"id":"a","text":"CSS Grid"},{"id":"b","text":"Flexbox"},{"id":"c","text":"Table layout"},{"id":"d","text":"Absolute positioning"}]',
    '["b"]',
    'Flexbox is a one-dimensional layout tool, ideal for arranging items in a single row or column like a navbar.',
    2),
  (quiz1, 'Which of these are valid reasons to prefer const over let? (select all that apply)',
    'multiple_select',
    '[{"id":"a","text":"It signals the value will not be reassigned"},{"id":"b","text":"It prevents accidental reassignment bugs"},{"id":"c","text":"It makes the variable a deep-frozen constant"},{"id":"d","text":"It is required for arrow functions"}]',
    '["a","b"]',
    'const prevents reassignment of the binding (catching bugs) and signals intent, but it does NOT deep-freeze objects/arrays, and arrow functions work fine with let or var too.',
    3),
  (quiz1, 'What does Array.prototype.filter() return?',
    'single_choice',
    '[{"id":"a","text":"A single combined value"},{"id":"b","text":"A new array containing only items that pass a test"},{"id":"c","text":"The first matching item"},{"id":"d","text":"The original array, mutated in place"}]',
    '["b"]',
    'filter() returns a new array containing only the elements for which the callback returned true — it never mutates the original array.',
    4);

  -- ============================================================
  -- Module 2: Building with React & APIs
  -- ============================================================
  insert into public.course_modules (course_id, title, description, sort_order)
  values (course_fullstack, 'Building with React & APIs', 'Compose interactive UIs and connect them to real data.', 2)
  returning id into mod2;

  insert into public.lessons (module_id, course_id, slug, title, content, key_takeaways, estimated_minutes, sort_order)
  values (
    mod2, course_fullstack, 'react-components-props', 'React Components & Props',
$$## Components are just functions

A React component is a function that returns JSX (HTML-like syntax in JavaScript):

```jsx
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}

<Greeting name="Ada" />
```

## Props flow one way: parent to child

`props` are how a parent passes data down to a child component. A component can never modify its own props — if something needs to change, that state lives in the parent, and the parent passes down new props.

```jsx
function CourseCard({ title, progress }) {
  return (
    <div>
      <h3>{title}</h3>
      <p>{progress}% complete</p>
    </div>
  );
}
```

This one-way data flow is what makes React apps predictable — you can always trace a piece of UI back to the props (and state) that produced it.
$$,
    array[
      'A component is just a function that returns JSX',
      'Props flow one-way, from parent to child',
      'A component should never try to modify its own props'
    ],
    10, 1
  )
  returning id into lesson_react;

  insert into public.lessons (module_id, course_id, slug, title, content, key_takeaways, estimated_minutes, sort_order)
  values (
    mod2, course_fullstack, 'state-events-hooks', 'State, Events & Hooks',
$$## useState: a component's own memory

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
```

Calling `setCount` doesn't just change a variable — it tells React "re-render this component with the new value." That's the core idea behind every React hook.

## Controlled inputs

```jsx
function NameInput() {
  const [name, setName] = useState("");

  return (
    <input value={name} onChange={(e) => setName(e.target.value)} />
  );
}
```

The input's value is always driven by state, and every keystroke updates that state — this is what makes the input "controlled" rather than letting the DOM manage its own value.

## The Rules of Hooks

Hooks like `useState` and `useEffect` must always be called at the top level of a component — never inside a condition, loop, or nested function. React relies on hooks being called in the exact same order on every render to keep track of which state belongs to which `useState` call.
$$,
    array[
      'useState gives a component memory that persists across re-renders',
      'A controlled input has its value driven entirely by React state',
      'Hooks must always be called in the same order — never inside conditionals or loops'
    ],
    12, 2
  )
  returning id into lesson_hooks;

  insert into public.lessons (module_id, course_id, slug, title, content, key_takeaways, estimated_minutes, sort_order)
  values (
    mod2, course_fullstack, 'connecting-to-rest-api', 'Connecting to a REST API',
$$## The loading/error/data pattern

Almost every real app needs to fetch data and handle three states: loading, error, and success.

```jsx
function useCourses() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/learning/courses")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
```

## Why this shape works so well

Returning `{ data, loading, error }` from a custom hook means every component that needs this data can just write:

```jsx
const { data, loading, error } = useCourses();

if (loading) return <p>Loading...</p>;
if (error) return <p>Something went wrong.</p>;
return <CourseList courses={data} />;
```

This is exactly the pattern used throughout this app's own dashboard — one hook, one clear shape, reused everywhere it's needed.
$$,
    array[
      'Real API calls need to handle loading, error and success states',
      'A custom hook returning {data, loading, error} keeps components simple and consistent',
      'useEffect is where side effects like data fetching belong, not directly in the render body'
    ],
    12, 3
  )
  returning id into lesson_api;

  insert into public.quizzes (module_id, course_id, slug, title, passing_score, estimated_minutes)
  values (mod2, course_fullstack, 'module-2-quiz', 'React & APIs Quiz', 70, 6)
  returning id into quiz2;

  insert into public.quiz_questions (quiz_id, question, question_type, options, correct_option_ids, explanation, sort_order) values
  (quiz2, 'What does calling a state setter (e.g. setCount) actually do?',
    'single_choice',
    '[{"id":"a","text":"Immediately mutates the variable in place"},{"id":"b","text":"Schedules a re-render with the new value"},{"id":"c","text":"Only works inside useEffect"},{"id":"d","text":"Deletes the previous value permanently"}]',
    '["b"]',
    'Calling a state setter tells React to re-render the component with the new value on the next render — it does not mutate anything synchronously.',
    1),
  (quiz2, 'What makes an input "controlled" in React?',
    'single_choice',
    '[{"id":"a","text":"It has a name attribute"},{"id":"b","text":"Its value is driven by React state"},{"id":"c","text":"It uses a ref instead of state"},{"id":"d","text":"It is disabled by default"}]',
    '["b"]',
    'A controlled input''s value comes from state and is updated via onChange — the DOM never manages the value independently.',
    2),
  (quiz2, 'Which of the following are true about the Rules of Hooks? (select all that apply)',
    'multiple_select',
    '[{"id":"a","text":"Hooks must be called at the top level of a component"},{"id":"b","text":"Hooks can be called inside if-statements as long as the condition rarely changes"},{"id":"c","text":"Hooks must be called in the same order on every render"},{"id":"d","text":"Only class components can use hooks"}]',
    '["a","c"]',
    'Hooks must always run at the top level, in the same order every render — never conditionally. Hooks are exclusive to function components, not class components.',
    3),
  (quiz2, 'In the {data, loading, error} hook pattern, what should a component render while loading is true?',
    'single_choice',
    '[{"id":"a","text":"The final data, even if it is null"},{"id":"b","text":"A loading state, before checking data or error"},{"id":"c","text":"Nothing at all, permanently"},{"id":"d","text":"An error message"}]',
    '["b"]',
    'Checking loading first (before error or data) avoids ever rendering a stale/empty data view while the request is still in flight.',
    4);

end $body$;
