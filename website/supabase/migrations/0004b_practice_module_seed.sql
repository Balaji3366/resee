-- NOTE: Run manually in the Supabase Dashboard SQL editor, AFTER
-- 0004_practice_module.sql. Seed content only — safe to re-run is NOT
-- guaranteed (no ON CONFLICT DO NOTHING on the content tables), so only
-- run this once against a given project.

do $body$
declare
  cat_aptitude uuid;
  cat_programming uuid;
  cat_qa uuid;
  cat_data_structures uuid;
  cat_sql uuid;
  cat_ai uuid;
  cat_communication uuid;
  cat_gov_exams uuid;

  topic_js uuid;
  topic_py uuid;
  topic_aptitude uuid;
  topic_qa uuid;
  topic_ds uuid;
  topic_sql uuid;
  topic_ai uuid;
  topic_comm uuid;
  topic_gov uuid;

  -- Pre-generated question ids so we can reference them again in
  -- mock_test_questions without a returning-into dance for every row.
  js1 uuid := gen_random_uuid();
  js2 uuid := gen_random_uuid();
  js3 uuid := gen_random_uuid();
  js4 uuid := gen_random_uuid();
  js5 uuid := gen_random_uuid();
  js6 uuid := gen_random_uuid();
  js7 uuid := gen_random_uuid();
  js8 uuid := gen_random_uuid();
  js9 uuid := gen_random_uuid();
  js10 uuid := gen_random_uuid();
  js11 uuid := gen_random_uuid();
  js12 uuid := gen_random_uuid();

  py1 uuid := gen_random_uuid();
  py2 uuid := gen_random_uuid();
  py3 uuid := gen_random_uuid();
  py4 uuid := gen_random_uuid();
  py5 uuid := gen_random_uuid();
  py6 uuid := gen_random_uuid();
  py7 uuid := gen_random_uuid();
  py8 uuid := gen_random_uuid();
  py9 uuid := gen_random_uuid();
  py10 uuid := gen_random_uuid();
  py11 uuid := gen_random_uuid();
  py12 uuid := gen_random_uuid();

  mock1 uuid;
begin

  -- ============================================================
  -- Categories (all 8 real, per the brief)
  -- ============================================================
  insert into public.practice_categories (slug, name, icon, sort_order) values
    ('aptitude', 'Aptitude', '🧮', 1)
    returning id into cat_aptitude;

  insert into public.practice_categories (slug, name, icon, sort_order) values
    ('programming', 'Programming', '💻', 2)
    returning id into cat_programming;

  insert into public.practice_categories (slug, name, icon, sort_order) values
    ('qa-testing', 'QA Testing', '🧪', 3)
    returning id into cat_qa;

  insert into public.practice_categories (slug, name, icon, sort_order) values
    ('data-structures', 'Data Structures', '🌳', 4)
    returning id into cat_data_structures;

  insert into public.practice_categories (slug, name, icon, sort_order) values
    ('sql', 'SQL', '🗄️', 5)
    returning id into cat_sql;

  insert into public.practice_categories (slug, name, icon, sort_order) values
    ('ai-basics', 'AI Basics', '🧠', 6)
    returning id into cat_ai;

  insert into public.practice_categories (slug, name, icon, sort_order) values
    ('communication', 'Communication', '🗣️', 7)
    returning id into cat_communication;

  insert into public.practice_categories (slug, name, icon, sort_order) values
    ('government-exams', 'Government Exams', '🏛️', 8)
    returning id into cat_gov_exams;

  -- ============================================================
  -- Topics — 2 real under Programming, 1 stub per other category
  -- ============================================================
  insert into public.practice_topics (slug, category_id, title, description, difficulty, icon, is_available, estimated_minutes, sort_order)
  values (
    'javascript-fundamentals',
    cat_programming,
    'JavaScript Fundamentals',
    'Test your grip on core JavaScript: types, scope, closures, and array methods.',
    'beginner',
    '💻',
    true,
    12,
    1
  )
  returning id into topic_js;

  insert into public.practice_topics (slug, category_id, title, description, difficulty, icon, is_available, estimated_minutes, sort_order)
  values (
    'python-basics',
    cat_programming,
    'Python Basics',
    'Cover the essentials of Python: syntax, data types, and control flow.',
    'beginner',
    '🐍',
    true,
    12,
    2
  )
  returning id into topic_py;

  insert into public.practice_topics (slug, category_id, title, description, difficulty, icon, is_available, estimated_minutes, sort_order)
  values ('quantitative-aptitude', cat_aptitude, 'Quantitative Aptitude', 'Numerical reasoning, percentages, ratios, and time-speed-distance problems.', 'beginner', '🧮', false, 15, 1)
  returning id into topic_aptitude;

  insert into public.practice_topics (slug, category_id, title, description, difficulty, icon, is_available, estimated_minutes, sort_order)
  values ('manual-testing-basics', cat_qa, 'Manual Testing Basics', 'Test case design, bug reporting, and core QA terminology.', 'beginner', '🧪', false, 15, 1)
  returning id into topic_qa;

  insert into public.practice_topics (slug, category_id, title, description, difficulty, icon, is_available, estimated_minutes, sort_order)
  values ('arrays-and-linked-lists', cat_data_structures, 'Arrays & Linked Lists', 'Core operations, complexity, and common interview patterns.', 'intermediate', '🌳', false, 15, 1)
  returning id into topic_ds;

  insert into public.practice_topics (slug, category_id, title, description, difficulty, icon, is_available, estimated_minutes, sort_order)
  values ('sql-joins-and-queries', cat_sql, 'SQL Joins & Queries', 'SELECT, JOIN, GROUP BY, and everyday query-writing skills.', 'beginner', '🗄️', false, 15, 1)
  returning id into topic_sql;

  insert into public.practice_topics (slug, category_id, title, description, difficulty, icon, is_available, estimated_minutes, sort_order)
  values ('ai-ml-foundations', cat_ai, 'AI & ML Foundations', 'Core AI/ML concepts, terminology, and how models are trained.', 'beginner', '🧠', false, 15, 1)
  returning id into topic_ai;

  insert into public.practice_topics (slug, category_id, title, description, difficulty, icon, is_available, estimated_minutes, sort_order)
  values ('effective-workplace-communication', cat_communication, 'Effective Workplace Communication', 'Clear writing, active listening, and giving feedback at work.', 'beginner', '🗣️', false, 15, 1)
  returning id into topic_comm;

  insert into public.practice_topics (slug, category_id, title, description, difficulty, icon, is_available, estimated_minutes, sort_order)
  values ('general-awareness', cat_gov_exams, 'General Awareness', 'Current affairs, civics, and general knowledge fundamentals.', 'beginner', '🏛️', false, 15, 1)
  returning id into topic_gov;

  -- ============================================================
  -- JavaScript Fundamentals — 12 questions
  -- ============================================================
  insert into public.practice_questions (id, topic_id, question, question_type, options, correct_option_ids, explanation, sort_order) values
  (js1, topic_js, 'What does `typeof null` return in JavaScript?', 'single_choice',
    '[{"id":"a","text":"\"null\""},{"id":"b","text":"\"undefined\""},{"id":"c","text":"\"object\""},{"id":"d","text":"\"number\""}]',
    '["c"]',
    'This is a long-standing JavaScript quirk: typeof null returns "object", even though null is not an object.',
    1),
  (js2, topic_js, 'Which keyword declares a block-scoped variable that can be reassigned?', 'single_choice',
    '[{"id":"a","text":"let"},{"id":"b","text":"const"},{"id":"c","text":"var"},{"id":"d","text":"function"}]',
    '["a"]',
    'let is block-scoped and reassignable; const is block-scoped but not reassignable, and var is function-scoped, not block-scoped.',
    2),
  (js3, topic_js, 'True or False: Arrow functions have their own `this` binding.', 'true_false',
    '[{"id":"a","text":"True"},{"id":"b","text":"False"}]',
    '["b"]',
    'Arrow functions do not bind their own this — they inherit this from the enclosing lexical scope.',
    3),
  (js4, topic_js, 'Which of these are falsy values in JavaScript? (select all that apply)', 'multiple_select',
    '[{"id":"a","text":"0"},{"id":"b","text":"\"\" (empty string)"},{"id":"c","text":"null"},{"id":"d","text":"\"0\" (string)"}]',
    '["a","b","c"]',
    '0, the empty string, and null are all falsy. The string "0" is truthy — any non-empty string is truthy.',
    4),
  (js5, topic_js, 'What does `Array.prototype.map()` return?', 'single_choice',
    '[{"id":"a","text":"A new array"},{"id":"b","text":"undefined"},{"id":"c","text":"The original array, mutated in place"},{"id":"d","text":"A single combined value"}]',
    '["a"]',
    'map() always returns a new array built from the callback''s return values — it never mutates the original array.',
    5),
  (js6, topic_js, 'True or False: `==` performs type coercion while `===` does not.', 'true_false',
    '[{"id":"a","text":"True"},{"id":"b","text":"False"}]',
    '["a"]',
    'The loose equality operator (==) coerces operands to a common type before comparing; strict equality (===) never coerces.',
    6),
  (js7, topic_js, 'Which of the following are valid ways to create a function in JavaScript? (select all that apply)', 'multiple_select',
    '[{"id":"a","text":"function foo() {}"},{"id":"b","text":"const foo = function () {}"},{"id":"c","text":"const foo = () => {}"},{"id":"d","text":"class foo() {}"}]',
    '["a","b","c"]',
    'A function declaration, a function expression, and an arrow function are all valid. "class foo() {}" is not valid function syntax.',
    7),
  (js8, topic_js, 'What is a closure in JavaScript?', 'single_choice',
    '[{"id":"a","text":"A function that retains access to its outer scope even after the outer function has returned"},{"id":"b","text":"A method to close a database connection"},{"id":"c","text":"A way to prevent memory leaks only"},{"id":"d","text":"A built-in JavaScript class"}]',
    '["a"]',
    'A closure is formed when a function remembers and can still access variables from the scope it was defined in, even after that outer scope has finished executing.',
    8),
  (js9, topic_js, 'True or False: `const` variables can have their object properties mutated even though the binding itself cannot be reassigned.', 'true_false',
    '[{"id":"a","text":"True"},{"id":"b","text":"False"}]',
    '["a"]',
    'const only prevents reassigning the variable binding — it does not freeze the value. Object properties and array contents remain mutable.',
    9),
  (js10, topic_js, 'Which array method removes the last element and returns it?', 'single_choice',
    '[{"id":"a","text":"pop()"},{"id":"b","text":"shift()"},{"id":"c","text":"slice()"},{"id":"d","text":"splice()"}]',
    '["a"]',
    'pop() removes and returns the last element of an array, mutating it in place. shift() does the same for the first element.',
    10),
  (js11, topic_js, 'What will `console.log(1 + "1")` output?', 'single_choice',
    '[{"id":"a","text":"\"11\""},{"id":"b","text":"2"},{"id":"c","text":"NaN"},{"id":"d","text":"an error"}]',
    '["a"]',
    'When one operand of + is a string, JavaScript coerces the number to a string and concatenates, producing "11".',
    11),
  (js12, topic_js, 'Which of these correctly check if a variable is an array? (select all that apply)', 'multiple_select',
    '[{"id":"a","text":"Array.isArray(x)"},{"id":"b","text":"typeof x === \"array\""},{"id":"c","text":"x instanceof Array"},{"id":"d","text":"x.constructor === Array"}]',
    '["a","c","d"]',
    'typeof an array is "object", never "array" — that option is always wrong. Array.isArray, instanceof, and checking the constructor are all valid (with some edge cases for instanceof/constructor across realms).',
    12);

  -- ============================================================
  -- Python Basics — 12 questions
  -- ============================================================
  insert into public.practice_questions (id, topic_id, question, question_type, options, correct_option_ids, explanation, sort_order) values
  (py1, topic_py, 'Which keyword is used to define a function in Python?', 'single_choice',
    '[{"id":"a","text":"def"},{"id":"b","text":"function"},{"id":"c","text":"func"},{"id":"d","text":"lambda"}]',
    '["a"]',
    'def introduces a named function definition. lambda creates an anonymous function expression, not a named one.',
    1),
  (py2, topic_py, 'True or False: Python uses indentation to define code blocks instead of curly braces.', 'true_false',
    '[{"id":"a","text":"True"},{"id":"b","text":"False"}]',
    '["a"]',
    'Python is whitespace-sensitive — consistent indentation is how blocks (if/for/def bodies, etc.) are delimited.',
    2),
  (py3, topic_py, 'What is the output of `print(3 // 2)` in Python?', 'single_choice',
    '[{"id":"a","text":"1.5"},{"id":"b","text":"1"},{"id":"c","text":"2"},{"id":"d","text":"an error"}]',
    '["b"]',
    '// is floor division — it divides and rounds down to the nearest integer, so 3 // 2 is 1.',
    3),
  (py4, topic_py, 'Which of these are mutable data types in Python? (select all that apply)', 'multiple_select',
    '[{"id":"a","text":"list"},{"id":"b","text":"tuple"},{"id":"c","text":"dict"},{"id":"d","text":"set"}]',
    '["a","c","d"]',
    'Lists, dicts, and sets can all be modified in place after creation. Tuples are immutable — once created, their contents cannot change.',
    4),
  (py5, topic_py, 'What does `len()` do in Python?', 'single_choice',
    '[{"id":"a","text":"Returns the number of items in an object"},{"id":"b","text":"Converts a string to lowercase"},{"id":"c","text":"Removes surrounding whitespace"},{"id":"d","text":"Reverses a list"}]',
    '["a"]',
    'len() returns the length (number of items) of a sequence or collection, such as a string, list, or dict.',
    5),
  (py6, topic_py, 'True or False: In Python, `is` compares values while `==` compares identity.', 'true_false',
    '[{"id":"a","text":"True"},{"id":"b","text":"False"}]',
    '["b"]',
    'It is the other way around: == compares values for equality, while is compares object identity (whether both names point to the same object in memory).',
    6),
  (py7, topic_py, 'Which of the following creates an empty dictionary?', 'single_choice',
    '[{"id":"a","text":"{}"},{"id":"b","text":"[]"},{"id":"c","text":"()"},{"id":"d","text":"set()"}]',
    '["a"]',
    '{} creates an empty dict. [] creates an empty list, () an empty tuple, and set() an empty set.',
    7),
  (py8, topic_py, 'Which of these are valid ways to iterate over a list in Python? (select all that apply)', 'multiple_select',
    '[{"id":"a","text":"for item in my_list:"},{"id":"b","text":"for i in range(len(my_list)):"},{"id":"c","text":"a while loop with a manual index"},{"id":"d","text":"my_list.forEach(fn)"}]',
    '["a","b","c"]',
    'Python lists have no forEach method — that is JavaScript syntax. Direct iteration, range-based indexing, and manual while loops are all valid in Python.',
    8),
  (py9, topic_py, 'What does the `self` parameter refer to in a Python class method?', 'single_choice',
    '[{"id":"a","text":"The instance the method is being called on"},{"id":"b","text":"The class itself"},{"id":"c","text":"A global variable"},{"id":"d","text":"Nothing — it is always optional"}]',
    '["a"]',
    'self is the conventional name for the first parameter of an instance method, referring to the specific instance the method was called on.',
    9),
  (py10, topic_py, 'True or False: Lists in Python can contain elements of different data types.', 'true_false',
    '[{"id":"a","text":"True"},{"id":"b","text":"False"}]',
    '["a"]',
    'Python lists are heterogeneous by default — a single list can freely mix strings, numbers, objects, and even other lists.',
    10),
  (py11, topic_py, 'What is a list comprehension in Python?', 'single_choice',
    '[{"id":"a","text":"A concise, single-line way to build a new list from an iterable"},{"id":"b","text":"A method to sort a list"},{"id":"c","text":"A way to write comments"},{"id":"d","text":"A built-in Python module"}]',
    '["a"]',
    'A list comprehension like [x * 2 for x in range(5)] builds a new list in a single, readable expression instead of a manual loop with .append().',
    11),
  (py12, topic_py, 'Which of these correctly open a file for reading in Python? (select all that apply)', 'multiple_select',
    '[{"id":"a","text":"open(\"file.txt\", \"r\")"},{"id":"b","text":"open(\"file.txt\")"},{"id":"c","text":"open(\"file.txt\", \"w\")"},{"id":"d","text":"open(\"file.txt\", \"rb\")"}]',
    '["a","b","d"]',
    '"r" (explicit read) and the default mode (also read) both open for reading; "rb" opens for reading in binary mode. "w" opens for writing, truncating the file — not reading.',
    12);

  -- ============================================================
  -- Mock test — draws from both real topics' question banks
  -- ============================================================
  insert into public.mock_tests (slug, title, description, difficulty, duration_minutes, is_available, sort_order)
  values (
    'programming-fundamentals-mock-test',
    'Programming Fundamentals Mock Test',
    'A timed, 20-question mock test covering JavaScript and Python fundamentals — simulates real exam conditions.',
    'beginner',
    30,
    true,
    1
  )
  returning id into mock1;

  insert into public.mock_test_questions (mock_test_id, question_id, sort_order) values
    (mock1, js1, 1), (mock1, js2, 2), (mock1, js3, 3), (mock1, js4, 4), (mock1, js5, 5),
    (mock1, js6, 6), (mock1, js7, 7), (mock1, js8, 8), (mock1, js9, 9), (mock1, js10, 10),
    (mock1, py1, 11), (mock1, py2, 12), (mock1, py3, 13), (mock1, py4, 14), (mock1, py5, 15),
    (mock1, py6, 16), (mock1, py7, 17), (mock1, py8, 18), (mock1, py9, 19), (mock1, py10, 20);

  -- Stub mock tests — Coming Soon, same honest pattern as the stub topics.
  insert into public.mock_tests (slug, title, description, difficulty, duration_minutes, is_available, sort_order) values
    ('aptitude-mock-test', 'Aptitude Mock Test', 'A timed test covering quantitative aptitude and reasoning.', 'beginner', 30, false, 2),
    ('sql-mock-test', 'SQL Mock Test', 'A timed test covering SQL queries and database concepts.', 'beginner', 30, false, 3),
    ('qa-testing-mock-test', 'QA Testing Mock Test', 'A timed test covering manual and automated testing fundamentals.', 'beginner', 30, false, 4);

end $body$;
