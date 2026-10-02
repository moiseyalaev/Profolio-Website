// Every photo on the personal pages, in one place.
// Files live in imgs/album/<slug>-1600.jpg and <slug>-640.jpg (see scripts/prepare-photo.py).
// `pending: true` marks a photo whose files have not been exported yet; the pages skip it.
// Remove the flag once both files are in imgs/album/.
// group: garden | kitchen | outdoors | making.  featured: shown in the Off the clock photo pile.
export const PHOTOS = [
  { pending: true, slug: 'harvest-counter', group: 'garden', featured: true, caption: "One afternoon's tomatoes and peppers", alt: 'Kitchen counter covered in tomatoes and peppers of every colour' },
  { pending: true, slug: 'seedlings', group: 'garden', featured: true, caption: 'Seedlings under the grow lights', alt: 'Trays of tomato and eggplant seedlings under a grow light' },
  { slug: 'onion-harvest', group: 'garden', caption: 'Onion harvest, curing on the porch', alt: 'A pile of freshly pulled onions with their green tops on porch steps' },
  { pending: true, slug: 'onion-bed', group: 'garden', caption: 'Onions sizing up in a mulched bed', alt: 'A large onion in a straw-mulched bed beside a drip line' },
  { pending: true, slug: 'peppers', group: 'garden', caption: 'Peppers in every colour', alt: 'Red, purple, green and yellow peppers spread across a counter' },
  { pending: true, slug: 'cabbage-harvest', group: 'garden', caption: 'Cabbage, zucchini and herbs', alt: 'Purple and green cabbages, zucchini and bundles of herbs on a round table' },
  { pending: true, slug: 'pepper-plant', group: 'garden', caption: 'Pepper plant in the bed', alt: 'A tall pepper plant with red peppers in a garden bed' },
  { pending: true, slug: 'basil', group: 'garden', caption: 'Basil by the door', alt: 'Green and purple basil bushes with a bowl of cut basil held in front' },
  { pending: true, slug: 'succulents', group: 'garden', caption: 'Succulent garden', alt: 'A dense bed of succulents in greens and oranges' },

  { pending: true, slug: 'pizza', group: 'kitchen', featured: true, caption: 'Pizza night', alt: 'A whole pizza with pepperoni and mushrooms on a wooden peel' },
  { pending: true, slug: 'skewers', group: 'kitchen', featured: true, caption: 'Skewers off the grill', alt: 'A hand holding a plate of charred meat skewers over a lawn' },
  { slug: 'dough-toss', group: 'kitchen', caption: 'Dough goes up', alt: 'Moisey in an apron tossing pizza dough into the air in his kitchen' },
  { pending: true, slug: 'brisket', group: 'kitchen', caption: 'Smoked brisket', alt: 'A dark-barked smoked brisket on butcher paper' },
  { pending: true, slug: 'beet-soup', group: 'kitchen', caption: 'Beet soup', alt: 'A bowl of deep red beet soup topped with chopped herbs' },
  { pending: true, slug: 'salmon', group: 'kitchen', caption: 'Salmon with eggplant', alt: 'Seared salmon on a white plate with an orange puree and roasted eggplant' },
  { pending: true, slug: 'onion-soup', group: 'kitchen', caption: 'Onion soup', alt: 'A crock of onion soup with melted cheese and herbs' },

  { pending: true, slug: 'backpack', group: 'outdoors', featured: true, caption: 'Packed in', alt: 'Moisey wearing a large blue backpack in a mountain meadow' },
  { pending: true, slug: 'grand-canyon', group: 'outdoors', featured: true, caption: 'Grand Canyon at sunset', alt: 'Moisey sitting on a rock at the rim of the Grand Canyon at sunset' },
  { slug: 'sequoia', group: 'outdoors', caption: 'Giant sequoia', alt: 'Looking up the trunk of a giant sequoia against a blue sky' },
  { pending: true, slug: 'fishing', group: 'outdoors', caption: 'Fishing off the granite', alt: 'A fishing rod propped on granite at the edge of a mountain lake' },
  { pending: true, slug: 'alpine-lake', group: 'outdoors', caption: 'Alpine lake', alt: 'Moisey in front of a green alpine lake below granite peaks' },
  { pending: true, slug: 'granite-trail', group: 'outdoors', caption: 'Granite trail', alt: 'A rocky trail climbing through a granite canyon with pines' },
  { pending: true, slug: 'orchard', group: 'outdoors', caption: 'Orchard in bloom', alt: 'A dirt lane between rows of trees in white blossom' },
  { pending: true, slug: 'dog-blossoms', group: 'outdoors', caption: 'Under the blossoms', alt: 'A dog walking under a blossoming tree on a carpet of fallen petals' },
  { pending: true, slug: 'palace', group: 'outdoors', caption: 'Palace of Fine Arts', alt: 'The Palace of Fine Arts rotunda reflected in its lagoon' },
  { pending: true, slug: 'dog-palace', group: 'outdoors', caption: 'With the dog in San Francisco', alt: 'Moisey leaning on his dog on a stone wall by a lagoon' },

  { slug: 'printed-lamp', group: 'making', caption: '3D-printed lamp, smart bulb inside', alt: 'A glowing green and blue 3D-printed lamp on a desk beside spare smart bulbs' }
];

export const GROUPS = [['all', 'All'], ['garden', 'Garden'], ['kitchen', 'Kitchen'], ['outdoors', 'Outdoors'], ['making', 'Making']];

export const src = (slug, size) => `imgs/album/${slug}-${size}.jpg`;

// The photos that are ready to show, in manifest order.
export const ready = photos => photos.filter(p => !p.pending);
