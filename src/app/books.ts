export type Book = {
  title: string;
  author?: string;
  synopsis: string;
  whenRead: string;
  rating?: number;
  // optional explicit search query for the cover lookup
  query?: string;
  // skip lookup and use this URL directly (for books OpenLibrary
  // doesn't have — paste any public cover URL with CORS open)
  coverUrl?: string;
};

export const books: Book[] = [
  {
    title: "Swami and Friends",
    author: "R. K. Narayan",
    synopsis:
      "A small-town boy in fictional Malgudi navigates school, friendship and the bewildering adult world of pre-independence India.",
    whenRead: "Kid",
    rating: 5,
  },
  {
    title: "One Indian Girl",
    author: "Chetan Bhagat",
    synopsis:
      "An ambitious investment banker reckons with three men, two continents and the question of whether a woman is allowed to want it all.",
    whenRead: "Adolescent",
    rating: 3.5,
  },
  {
    title: "Great Expectations",
    author: "Charles Dickens",
    synopsis:
      "Pip, a poor village orphan, is suddenly handed a fortune by a mystery benefactor — and a slow, painful education in what 'gentleman' really costs.",
    whenRead: "Kid",
    rating: 4,
  },
  {
    title: "Revolution 2020",
    author: "Chetan Bhagat",
    synopsis:
      "Two best friends and one girl get pulled into Varanasi's coaching-class racket, where love, ambition and corruption all want the same thing.",
    whenRead: "Adolescent",
    rating: 3,
  },
  {
    title: "The Girl in Room 105",
    author: "Chetan Bhagat",
    synopsis:
      "A heart-broken IIT graduate sneaks into his ex's hostel room and finds her dead — and gets dragged into a thriller bigger than his break-up.",
    whenRead: "Teen",
    rating: 3.5,
  },
  {
    title: "One Arranged Murder",
    author: "Chetan Bhagat",
    synopsis:
      "An arranged engagement turns into a murder investigation when the bride is found dead on Karva Chauth — and her fiancé becomes the prime suspect.",
    whenRead: "College (16+)",
    rating: 3,
  },
  {
    title: "Half Girlfriend",
    author: "Chetan Bhagat",
    synopsis:
      "A Bihari boy at a posh Delhi college falls for a girl who agrees to be exactly half of his girlfriend — and nothing more.",
    whenRead: "16",
    rating: 4,
  },
  {
    title: "A Study in Scarlet",
    author: "Arthur Conan Doyle",
    synopsis:
      "The very first Holmes case — a Mormon revenge plot, a German word scrawled in blood, and the moment Watson meets a man who notices everything.",
    whenRead: "Kid",
    rating: 5,
    query: "A Study in Scarlet Conan Doyle",
  },
  {
    title: "The Sign of Four",
    author: "Arthur Conan Doyle",
    synopsis:
      "A stolen Indian treasure, a one-legged convict and a love story for Watson — Holmes' second outing leans hard into Empire's ghosts.",
    whenRead: "Kid",
    rating: 4,
  },
  {
    title: "The Adventures of Sherlock Holmes",
    author: "Arthur Conan Doyle",
    synopsis:
      "Twelve short cases — from Bohemia to the speckled band — that turned 221B Baker Street into the most famous address in fiction.",
    whenRead: "Kid",
    rating: 4,
  },
  {
    title: "The Memoirs of Sherlock Holmes",
    author: "Arthur Conan Doyle",
    synopsis:
      "Eleven more cases ending in The Final Problem, where Holmes and Moriarty go over the Reichenbach Falls and break a generation of readers.",
    whenRead: "Kid",
    rating: 4,
  },
  {
    title: "The Hound of the Baskervilles",
    author: "Arthur Conan Doyle",
    synopsis:
      "A glowing demon dog haunts a Devon family on the moors. Holmes sends Watson ahead and reads the case from London — until he doesn't.",
    whenRead: "Kid",
    rating: 4,
  },
  {
    title: "The Return of Sherlock Holmes",
    author: "Arthur Conan Doyle",
    synopsis:
      "Holmes isn't dead. Thirteen stories on why the world's only consulting detective came back, beginning with an empty house and a wax dummy.",
    whenRead: "Kid",
    rating: 4,
  },
  {
    title: "His Last Bow",
    author: "Arthur Conan Doyle",
    synopsis:
      "Eight late cases, including the title story where an aging Holmes catches a German spy on the eve of the First World War.",
    whenRead: "Kid",
    rating: 4,
  },
  {
    title: "The Case-Book of Sherlock Holmes",
    author: "Arthur Conan Doyle",
    synopsis:
      "The final twelve stories — stranger, darker, weirder. Vampires, lions and disfigurements. Holmes' farewell to print.",
    whenRead: "Kid",
    rating: 4,
  },
  {
    title: "And Then There Were None",
    author: "Agatha Christie",
    synopsis:
      "Ten strangers lured to an island. A nursery rhyme on the wall. One by one they die — and the killer is one of them. My first detective book.",
    whenRead: "Kid",
    rating: 5,
  },
  {
    title: "Death on the Nile",
    author: "Agatha Christie",
    synopsis:
      "A honeymoon cruise down the Nile turns into a Poirot puzzle when an heiress is shot in her cabin and everyone has a reason to want her gone.",
    whenRead: "Teen",
    rating: 4.5,
  },
  {
    title: "Oliver Twist",
    author: "Charles Dickens",
    synopsis:
      "A workhouse orphan asks for more, runs to London, and falls in with Fagin's pickpocket gang — Dickens at his angriest about what cities do to kids.",
    whenRead: "Kid",
    rating: 4,
  },
  {
    title: "Diary of a Wimpy Kid",
    author: "Jeff Kinney",
    synopsis:
      "Greg Heffley starts middle school and immediately starts losing — the diary is for posterity, when he's rich and famous.",
    whenRead: "Kid",
    rating: 5,
  },
  {
    title: "Rodrick Rules",
    author: "Jeff Kinney",
    synopsis:
      "Greg's older brother Rodrick has a Very Embarrassing Secret on him. Summer goes badly. So does the school year.",
    whenRead: "Kid",
    rating: 5,
    query: "Diary of a Wimpy Kid Rodrick Rules",
  },
  {
    title: "The Last Straw",
    author: "Jeff Kinney",
    synopsis:
      "Greg's dad is one Greg-related disaster away from shipping him to military academy. Greg attempts to become a better person. It doesn't take.",
    whenRead: "Kid",
    rating: 5,
    query: "Diary of a Wimpy Kid The Last Straw",
  },
  {
    title: "Dog Days",
    author: "Jeff Kinney",
    synopsis:
      "Summer break, indoor video games, and a country club he doesn't belong to. Greg learns there's no graceful way to be a tween in July.",
    whenRead: "Kid",
    rating: 5,
    query: "Diary of a Wimpy Kid Dog Days",
  },
  {
    title: "The Ugly Truth",
    author: "Jeff Kinney",
    synopsis:
      "Greg and Rowley have fallen out, and middle school starts handing him the Talk-shaped pamphlets nobody wants.",
    whenRead: "Kid",
    rating: 5,
    query: "Diary of a Wimpy Kid The Ugly Truth",
  },
  {
    title: "Cabin Fever",
    author: "Jeff Kinney",
    synopsis:
      "A blizzard traps the Heffleys at home right when Greg most needs to be anywhere else — including out of trouble at school.",
    whenRead: "Kid",
    rating: 5,
    query: "Diary of a Wimpy Kid Cabin Fever",
  },
  {
    title: "The Third Wheel",
    author: "Jeff Kinney",
    synopsis:
      "Valentine's dance is coming, Greg has no date, and his mom is making him watch a baby. Romance, briefly attempted.",
    whenRead: "Kid",
    rating: 5,
    query: "Diary of a Wimpy Kid The Third Wheel",
  },
  {
    title: "Hard Luck",
    author: "Jeff Kinney",
    synopsis:
      "Rowley has a new girlfriend, Greg is alone, and an 8-ball is now making his decisions. Going great.",
    whenRead: "Kid",
    rating: 5,
    query: "Diary of a Wimpy Kid Hard Luck",
  },
  {
    title: "The Long Haul",
    author: "Jeff Kinney",
    synopsis:
      "Family road trip. One pig, one broken-down van, one waterpark. Greg wonders, again, why he is the way he is.",
    whenRead: "Kid",
    rating: 5,
    query: "Diary of a Wimpy Kid The Long Haul",
  },
  {
    title: "Old School",
    author: "Jeff Kinney",
    synopsis:
      "The town goes phone-free for a week and Greg has to survive a no-electronics camp run by people who actually like the outdoors.",
    whenRead: "Kid",
    rating: 4.5,
    query: "Diary of a Wimpy Kid Old School",
  },
  {
    title: "Double Down",
    author: "Jeff Kinney",
    synopsis:
      "Greg's mom thinks he needs a creative passion. Greg discovers horror filmmaking. Things, predictably, escalate.",
    whenRead: "Kid",
    rating: 4.5,
    query: "Diary of a Wimpy Kid Double Down",
  },
  {
    title: "The Getaway",
    author: "Jeff Kinney",
    synopsis:
      "The Heffleys take a tropical vacation. The Heffleys do not take a tropical vacation well.",
    whenRead: "Kid",
    rating: 4,
    query: "Diary of a Wimpy Kid The Getaway",
  },
  {
    title: "The Meltdown",
    author: "Jeff Kinney",
    synopsis:
      "A snow day turns into a neighbourhood-wide kid war. Greg picks the wrong sled and the wrong side.",
    whenRead: "Kid",
    rating: 4,
    query: "Diary of a Wimpy Kid The Meltdown",
  },
  {
    title: "Wrecking Ball",
    author: "Jeff Kinney",
    synopsis:
      "The Heffleys get money for a home renovation. Walls come down. So does everyone's patience.",
    whenRead: "Kid",
    rating: 3.5,
    query: "Diary of a Wimpy Kid Wrecking Ball",
  },
  {
    title: "The Deep End",
    author: "Jeff Kinney",
    synopsis:
      "A road trip in an RV, a campground full of weather, and Greg trapped with his entire family. As nature intended.",
    whenRead: "Kid",
    rating: 3.5,
    query: "Diary of a Wimpy Kid The Deep End",
    coverUrl:
      "https://images-na.ssl-images-amazon.com/images/P/1419748688.01.LZZZZZZZ.jpg",
  },
  {
    title: "Big Shot",
    author: "Jeff Kinney",
    synopsis:
      "Greg accidentally joins a basketball team. Greg is not a basketball player. The season is long.",
    whenRead: "Kid",
    rating: 3,
    query: "Diary of a Wimpy Kid Big Shot",
  },
  {
    title: "Diper Överlöde",
    author: "Jeff Kinney",
    synopsis:
      "Greg follows Rodrick's band Löded Diper as they chase fame, which mostly means parking lots and arguments.",
    whenRead: "Kid",
    rating: 3,
    query: "Diary of a Wimpy Kid Diper Overlode",
  },
  {
    title: "No Brainer",
    author: "Jeff Kinney",
    synopsis:
      "Greg's middle school is falling apart — literally — and the kids decide to save it. Bureaucracy intervenes.",
    whenRead: "Kid",
    rating: 2.5,
    query: "Diary of a Wimpy Kid No Brainer",
  },
  {
    title: "Hot Mess",
    author: "Jeff Kinney",
    synopsis:
      "Both sides of the Heffley extended family converge for one chaotic weekend. Greg gets a front-row seat.",
    whenRead: "Kid",
    rating: 2.5,
    query: "Diary of a Wimpy Kid Hot Mess",
    coverUrl:
      "https://images-na.ssl-images-amazon.com/images/P/1419766945.01.LZZZZZZZ.jpg",
  },
  {
    title: "Partypooper",
    author: "Jeff Kinney",
    synopsis:
      "Greg is older now but the parties keep finding him. The latest Wimpy Kid — read as an adult, hits different.",
    whenRead: "Adult",
    rating: 3,
    query: "Diary of a Wimpy Kid Partypooper",
    coverUrl: "covers/partypooper.webp",
  },
  {
    title: "Tom Gates Series",
    author: "Liz Pichon",
    synopsis:
      "Tom doodles his way through school, sibling annoyance and dreams of being in the world's best band, DOGZOMBIES.",
    whenRead: "Teen",
    rating: 3.75,
    query: "Tom Gates Liz Pichon",
  },
  {
    title: "The Hunger Games",
    author: "Suzanne Collins",
    synopsis:
      "Katniss volunteers for her sister and walks into a televised fight-to-the-death — the Capitol's favourite show, and her accidental revolution.",
    whenRead: "Teen",
    rating: 5,
  },
  {
    title: "Catching Fire",
    author: "Suzanne Collins",
    synopsis:
      "Victors get pulled back into the arena. The rebellion is no longer subtext. Katniss is no longer optional.",
    whenRead: "Teen",
    rating: 5,
  },
  {
    title: "Mockingjay",
    author: "Suzanne Collins",
    synopsis:
      "Panem is at war and Katniss has been cast as its symbol. The book asks: what does winning even mean here?",
    whenRead: "Teen",
    rating: 5,
  },
  {
    title: "Verity",
    author: "Colleen Hoover",
    synopsis:
      "A struggling writer is hired to finish a bestselling author's series and finds, in the office, an autobiography she was never meant to see.",
    whenRead: "Adult",
    rating: 4,
  },
  {
    title: "Bride",
    author: "Ali Hazelwood",
    synopsis:
      "A vampire heiress is married off to a werewolf alpha to keep a fragile truce. Neither one expected to actually like the other.",
    whenRead: "Adult",
    rating: 3.5,
  },
  {
    title: "The Love Hypothesis",
    author: "Ali Hazelwood",
    synopsis:
      "A PhD student fake-dates the meanest professor in her department to convince her best friend she's fine. He is not, it turns out, mean.",
    whenRead: "Adult",
    rating: 3.5,
  },
  {
    title: "It Ends With Us",
    author: "Colleen Hoover",
    synopsis:
      "Lily falls hard for a neurosurgeon and slowly realises she's repeating the relationship she swore she'd never have.",
    whenRead: "Adult",
    rating: 3,
  },
  {
    title: "12 Years My Messed-Up Love Story",
    author: "Chetan Bhagat",
    synopsis:
      "A twelve-year on-and-off relationship told in messy, real-time pieces — friendship, distance, jealousy, and the long tail of first love.",
    whenRead: "Adult",
    rating: 3,
    coverUrl:
      "https://images-na.ssl-images-amazon.com/images/P/9369896872.01.LZZZZZZZ.jpg",
  },
  {
    title: "The Forty Rules of Love",
    author: "Elif Shafak",
    synopsis:
      "A bored housewife reads a manuscript about Rumi and Shams of Tabriz — and slowly her life starts to follow the rules in the book.",
    whenRead: "Adult",
    rating: 5,
    coverUrl:
      "https://images-na.ssl-images-amazon.com/images/P/0143118528.01.LZZZZZZZ.jpg",
  },
  {
    title: "Twilight",
    author: "Stephenie Meyer",
    synopsis:
      "Bella moves to Forks, meets a boy who is very pale and very fast, and decides he's worth the small inconvenience of him being a vampire.",
    whenRead: "Adult",
    rating: 4,
  },
  {
    title: "New Moon",
    author: "Stephenie Meyer",
    synopsis:
      "Edward leaves. Bella breaks. Jacob is there. Italy is a bad idea. The most depressed book about teenagers ever filmed in soft focus.",
    whenRead: "Adult",
    rating: 3.5,
  },
  {
    title: "Eclipse",
    author: "Stephenie Meyer",
    synopsis:
      "A newborn vampire army is hunting Bella. Vampires and werewolves have to work together. Bella has to pick.",
    whenRead: "Adult",
    rating: 3,
  },
  {
    title: "Breaking Dawn",
    author: "Stephenie Meyer",
    synopsis:
      "Wedding. Honeymoon. Pregnancy. War with the Volturi. Twilight's final book swings for the fences and mostly catches them.",
    whenRead: "Adult",
    rating: 3,
  },
  {
    title: "1984",
    author: "George Orwell",
    synopsis:
      "Winston works at the Ministry of Truth rewriting the past and starts keeping a diary. The Party is watching. The Party is always watching.",
    whenRead: "Adult",
    rating: 5,
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    synopsis:
      "A shepherd boy follows a recurring dream from Spain to the pyramids of Egypt and learns the universe's least subtle lesson on purpose.",
    whenRead: "Adult",
    rating: 4,
    coverUrl:
      "https://images-na.ssl-images-amazon.com/images/P/0062315005.01.LZZZZZZZ.jpg",
  },
  {
    title: "Days at the Morisaki Bookshop",
    author: "Satoshi Yagisawa",
    synopsis:
      "A heartbroken twenty-five-year-old moves in above her uncle's secondhand bookshop in Jimbocho and slowly, quietly, starts to be okay.",
    whenRead: "Adult",
    rating: 3.75,
  },
  {
    title: "More Days at the Morisaki Bookshop",
    author: "Satoshi Yagisawa",
    synopsis:
      "Takako is back in Jimbocho. Her aunt has stories. The bookshop, as always, holds everyone gently in place.",
    whenRead: "Adult",
    rating: 3.5,
    coverUrl:
      "https://images-na.ssl-images-amazon.com/images/P/0063278715.01.LZZZZZZZ.jpg",
  },
  {
    title: "A Good Girl's Guide to Murder",
    author: "Holly Jackson",
    synopsis:
      "Pip's senior capstone project is reopening a small-town murder case everyone agrees was solved. They are wrong, and her town gets nervous.",
    whenRead: "Teen",
    rating: 4,
    coverUrl:
      "https://images-na.ssl-images-amazon.com/images/P/1984896393.01.LZZZZZZZ.jpg",
  },
  {
    title: "Shatter Me",
    author: "Tahereh Mafi",
    synopsis:
      "Juliette has not touched anyone in 264 days because the last person she touched died. Then the regime decides she's a useful weapon.",
    whenRead: "Adult",
    rating: 3.75,
  },
  {
    title: "Gone Girl",
    author: "Gillian Flynn",
    synopsis:
      "Amy disappears on her fifth wedding anniversary and her husband Nick starts looking guilty on national television. Then Amy's diary turns up.",
    whenRead: "Adult",
    rating: 4.75,
  },
  {
    title: "Percy Jackson and the Lightning Thief",
    author: "Rick Riordan",
    synopsis:
      "A twelve-year-old with ADHD finds out he's the son of Poseidon, gets accused of stealing Zeus' master bolt, and has ten days to fix it.",
    whenRead: "Kid",
    rating: 5,
  },
  {
    title: "The Sea of Monsters",
    author: "Rick Riordan",
    synopsis:
      "Camp Half-Blood is dying. The Golden Fleece can save it. Unfortunately it is in the Bermuda Triangle and there is a cyclops.",
    whenRead: "Kid",
    rating: 5,
    query: "Percy Jackson Sea of Monsters",
  },
  {
    title: "The Titan's Curse",
    author: "Rick Riordan",
    synopsis:
      "Annabeth is missing and Artemis is captured. A quest of five demigods heads west, and Percy is, again, not on it. Until he is.",
    whenRead: "Kid",
    rating: 5,
    query: "Percy Jackson Titan's Curse",
  },
  {
    title: "The Battle of the Labyrinth",
    author: "Rick Riordan",
    synopsis:
      "Daedalus' maze runs under all of America, and Kronos' army wants to use it to invade camp. Percy goes in.",
    whenRead: "Kid",
    rating: 4.5,
    query: "Percy Jackson Battle of the Labyrinth",
  },
  {
    title: "The Last Olympian",
    author: "Rick Riordan",
    synopsis:
      "Manhattan is asleep. Olympus is exposed. The Titans are marching up Fifth Avenue and Percy turns sixteen tomorrow. Showtime.",
    whenRead: "Kid",
    rating: 5,
    query: "Percy Jackson Last Olympian",
  },
  {
    title: "Sandworm",
    author: "Andy Greenberg",
    synopsis:
      "The true story of Russia's most aggressive state hackers — the people behind NotPetya, blackouts in Ukraine, and the dawn of cyberwar.",
    whenRead: "Adult",
    rating: 3.75,
  },
  {
    title: "Turtles All the Way Down",
    author: "John Green",
    synopsis:
      "Aza Holmes tries to solve the disappearance of a fugitive billionaire while her own intrusive thoughts try to solve her.",
    whenRead: "Teen",
    rating: 4,
  },
  {
    title: "Murder on the Orient Express",
    author: "Agatha Christie",
    synopsis:
      "An American gangster is stabbed twelve times on a snowed-in train. Poirot has thirteen suspects and one famous, perfect answer.",
    whenRead: "Kid",
    rating: 3.75,
  },
  {
    title: "The House in the Cerulean Sea",
    author: "TJ Klune",
    synopsis:
      "A by-the-book caseworker is sent to evaluate an orphanage of six magical, possibly apocalyptic children. He stays for the lighthouse keeper.",
    whenRead: "Adult",
    rating: 5,
    coverUrl:
      "https://images-na.ssl-images-amazon.com/images/P/1250217288.01.LZZZZZZZ.jpg",
  },
  {
    title: "Somewhere Beyond the Sea",
    author: "TJ Klune",
    synopsis:
      "Arthur Parnassus tells his side now — the boy who became a phoenix and the man who decided this island would be a sanctuary.",
    whenRead: "Adult",
    rating: 4.75,
    coverUrl:
      "https://images-na.ssl-images-amazon.com/images/P/1250217342.01.LZZZZZZZ.jpg",
  },
  {
    title: "Romeo and Juliet",
    author: "William Shakespeare",
    synopsis:
      "Two teenagers from feuding Verona families fall in love on Sunday and are both dead by Thursday. Nobody's fault. Everybody's fault.",
    whenRead: "Mid Teens",
    rating: 4,
  },
  {
    title: "Legends & Lattes",
    author: "Travis Baldree",
    synopsis:
      "An orc warrior hangs up her sword to open the first coffee shop in a fantasy city that has never heard of espresso.",
    whenRead: "Adult",
    rating: 4,
  },
  {
    title: "Babel",
    author: "R. F. Kuang",
    synopsis:
      "Oxford's Translation Institute runs the British Empire on enchanted silver bars. Robin Swift, brought from Canton, is meant to serve it.",
    whenRead: "Start of Adult",
    rating: 4.5,
  },
  {
    title: "Strange Houses",
    author: "Uketsu",
    synopsis:
      "A floor plan with one impossible room. A reader, a writer, an architect. The whole horror is in the geometry.",
    whenRead: "Adult",
    rating: 3.75,
  },
  {
    title: "Strange Buildings",
    author: "Uketsu",
    synopsis:
      "More architectural puzzles that turn into murders. Uketsu's gimmick — drawings as evidence — gets nastier and better.",
    whenRead: "Adult",
    rating: 4,
  },
  {
    title: "Etee Tomar Maa",
    author: "Sanjib Chattopadhyay",
    synopsis:
      "A Bengali novel of memory and motherhood — letters and silences from a woman to the child she could not raise.",
    whenRead: "Adult",
    rating: 5,
    coverUrl:
      "https://cdn.jsdelivr.net/gh/Eeman1113/all_the_books_i_have_ever_read@main/public/covers/etee-tomar-maa.webp",
  },
  {
    title: "Mahagatha",
    author: "Satyarth Nayak",
    synopsis:
      "One hundred tales from the Puranas retold cleanly — gods, demons, sages and the long, weird logic that holds Hindu cosmology together.",
    whenRead: "Adult",
    rating: 4,
  },
  {
    title: "A Man Called Ove",
    author: "Fredrik Backman",
    synopsis:
      "A grumpy Swedish widower is interrupted on the way to his own funeral by a pregnant Iranian neighbour with a bad-parking husband.",
    whenRead: "Adult",
    rating: 4.75,
    coverUrl:
      "https://images-na.ssl-images-amazon.com/images/P/1476738025.01.LZZZZZZZ.jpg",
  },
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    synopsis:
      "A man wakes up alone on a spaceship with no memory of who he is, only that the sun is dying and he is the last shot at saving Earth.",
    whenRead: "Adult",
    rating: 5,
  },
  {
    title: "Dungeon Crawler Carl",
    author: "Matt Dinniman",
    synopsis:
      "Aliens demolish Earth and replace it with a televised, monetised, increasingly horrifying dungeon. Carl and his ex's cat sign in.",
    whenRead: "Adult",
    rating: 5,
  },
  {
    title: "Gulliver's Travels",
    author: "Jonathan Swift",
    synopsis:
      "A ship's surgeon visits tiny people, giant people, floating scientists and talking horses, and each time likes humans a little less.",
    whenRead: "Kid, Teen",
    rating: 3.75,
  },
  {
    title: "Three Men in a Boat",
    author: "Jerome K. Jerome",
    synopsis:
      "Three friends and a dog set off up the Thames for their health. Almost nothing of significance happens, perfectly.",
    whenRead: "Teen",
    rating: 3.75,
  },
  {
    title: "Around the World in Eighty Days",
    author: "Jules Verne",
    synopsis:
      "Phileas Fogg bets his fortune that he can circumnavigate the globe in 80 days. He sets off the next morning with a valet and a timetable.",
    whenRead: "Kid, Teen",
    rating: 4.25,
  },
  {
    title: "Harry Potter and the Philosopher's Stone",
    author: "J. K. Rowling",
    synopsis:
      "Eleven-year-old Harry finds out he's a wizard, goes to a Scottish boarding school for it, and learns his parents weren't killed in a car crash.",
    whenRead: "Adult",
    rating: 5,
  },
  {
    title: "Harry Potter and the Chamber of Secrets",
    author: "J. K. Rowling",
    synopsis:
      "Something is petrifying students. A diary writes back. The Heir of Slytherin is in the castle and Harry's the only one who can hear it.",
    whenRead: "Adult",
    rating: 4.5,
  },
  {
    title: "Harry Potter and the Prisoner of Azkaban",
    author: "J. K. Rowling",
    synopsis:
      "Sirius Black has escaped wizard prison and is supposedly coming for Harry. Dementors guard the school. Time, in the end, gets weird.",
    whenRead: "Adult",
    rating: 4.5,
  },
  {
    title: "Harry Potter and the Goblet of Fire",
    author: "J. K. Rowling",
    synopsis:
      "Harry's name comes out of a magical cup that should not have allowed it. A tournament, a graveyard, and a war that was never really over.",
    whenRead: "Adult",
    rating: 4.5,
  },
  {
    title: "Harry Potter and the Order of the Phoenix",
    author: "J. K. Rowling",
    synopsis:
      "Nobody believes Voldemort is back. The Ministry takes over Hogwarts. Harry, for the entire book, is allowed to be furious.",
    whenRead: "Adult",
    rating: 4.5,
  },
  {
    title: "Harry Potter and the Half-Blood Prince",
    author: "J. K. Rowling",
    synopsis:
      "Dumbledore takes Harry into the memories of a young Tom Riddle. A secondhand potions book becomes someone's diary. The tower.",
    whenRead: "Adult",
    rating: 4.5,
  },
  {
    title: "Harry Potter and the Deathly Hallows",
    author: "J. K. Rowling",
    synopsis:
      "No school this year. Three teenagers in a tent chasing horcruxes across Britain, and a final return to the castle.",
    whenRead: "Adult",
    rating: 4,
  },
  {
    title: "The Metamorphosis",
    author: "Franz Kafka",
    synopsis:
      "Gregor Samsa wakes up as a giant insect. The horror is not really the insect; it is how quickly his family adjusts.",
    whenRead: "Adult",
    rating: 4.75,
  },
  {
    title: "White Nights",
    author: "Fyodor Dostoevsky",
    synopsis:
      "Over four sleepless St. Petersburg nights, a lonely dreamer meets a girl on a bridge and tells himself something is finally happening.",
    whenRead: "Adult",
    rating: 5,
  },
  {
    title: "Co-Intelligence",
    author: "Ethan Mollick",
    synopsis:
      "A short, practical book on living and working with large language models as collaborators rather than tools or threats.",
    whenRead: "Adult",
    rating: 4,
    coverUrl: "https://images.penguinrandomhouse.com/cover/9780593716717",
  },
  {
    title: "Mahabharata",
    author: "Vyasa",
    synopsis:
      "Two sets of cousins, one throne, and an eighteen-day war that pulls in every god, sage and ethical question the subcontinent has.",
    whenRead: "Adult",
    rating: 4,
  },
  {
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    author: "Gabrielle Zevin",
    synopsis:
      "Sam and Sadie make video games together for thirty years. They are, repeatedly, almost in love. They are, repeatedly, not.",
    whenRead: "Adult",
    rating: 5,
  },
  {
    title: "Maus",
    author: "Art Spiegelman",
    synopsis:
      "A cartoonist interviews his father, a Polish Jew who survived Auschwitz. Jews are mice. Germans are cats. The horror lands harder for it.",
    whenRead: "Late Teen",
    rating: 5,
  },
  {
    title: "Sapiens",
    author: "Yuval Noah Harari",
    synopsis:
      "A brief and opinionated history of how a particular kind of ape ended up owning the planet, mostly by inventing things that aren't real.",
    whenRead: "Adult",
    rating: 4,
  },
  {
    title: "Black Beauty",
    author: "Anna Sewell",
    synopsis:
      "An English carriage horse tells his own life — gentle owners, cruel ones, London cabs — and quietly campaigns for being kinder to animals.",
    whenRead: "Kid",
    rating: 3.75,
  },
  {
    title: "Harry Potter and the Cursed Child",
    author: "J. K. Rowling, John Tiffany, Jack Thorne",
    synopsis:
      "Albus Potter, Scorpius Malfoy, a Time-Turner, and several alternate timelines later — sons trying not to become their fathers.",
    whenRead: "Adult",
    rating: 3.75,
  },
  {
    title: "Butter",
    author: "Asako Yuzuki",
    synopsis:
      "A journalist visits a convicted con-woman who allegedly killed her lovers by feeding them. Then she starts eating like her. Then.",
    whenRead: "Adult",
    rating: 4.25,
  },
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    synopsis:
      "Black holes, the big bang, time's arrow — Hawking explains why the universe behaves like this, with exactly one equation.",
    whenRead: "Teen",
    rating: 4.75,
  },
  {
    title: "The Universe in a Nutshell",
    author: "Stephen Hawking",
    synopsis:
      "The illustrated follow-up — branes, M-theory, holography — where Hawking goes from 'big bang' to 'we may be holograms.'",
    whenRead: "Teen",
    rating: 4,
  },
  {
    title: "Journey to the Center of the Earth",
    author: "Jules Verne",
    synopsis:
      "A professor decodes a runic note, drags his nephew into an Icelandic volcano, and finds a prehistoric ocean underneath Europe.",
    whenRead: "Kid",
    rating: 3.75,
  },
];
