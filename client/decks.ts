const starterDecks = {
  "Blue": ["Survey Tower","System of Tunnels","Workshop","Lesser Bank","Secret Passage","Assassination","Mysterious Salesman","Careful Detonation","Bank","Arms Depot","Seek Truth","Seek Truth","Flare","Flare","Aspiring Lawman","Aspiring Lawman","Bring to Justice","Bring to Justice","Civic Servant","Ruthless Investigator","Ruthless Investigator","Ruthless Investigator","Impound Office","Mass Detain","Tax Collector","Captain Belmont","Lawman Academy","Prison","Exhaustive Search","Grand Confiscator"],
  "Green": ["System of Tunnels","Mysterious Salesman","Lesser Bank","Workshop","Assassination","Assassination","Assassination","Bank","Arms Depot","Minor Investment","Minor Investment","Wise Venture","Wise Venture","Wise Venture","Eager Salesman","Eager Salesman","Eager Salesman","Company Agent","Company Agent","Consult Operatives","Consult Operatives","Grindset Hypehouse","Property Broker","Property Broker","Dealer of Secrets","Flaunting Aristocrat","Tantalizing Offer","Factory","Charismatic Industrialist","Utilize Wealth"],
  "Orange": ["Meeting Spot","Employment Office","Workshop","Lesser Bank","Assassination","Arms Depot","Coerce","Sneek a Peek","Hasty Silencing","Hasty Silencing","Outnumber","Outnumber","Meandering Cynic","Meandering Cynic","Reckless Truthseeker","Reckless Truthseeker","Reckless Truthseeker","Vandalism","Vandalism","Inspired Militiaman","Inspired Militiaman","Inspired Militiaman","Streetwise Mentor","Enthusiastic Recruiter","Enthusiastic Recruiter","Raving Pugilist","Raving Pugilist","Raving Pugilist","Sudden Revolt","Sudden Revolt"],
  "Purple": ["Brief Investigation","Shady Deal","Snoop About","Meeting Spot","Lesser Bank","Mysterious Salesman","City Hall","Acquire Information","Acquire Information","Disloyal Operative","New Hire","New Hire","New Hire","Murder","Murder","Murder","Petty Dealer","Petty Dealer","Vindictive Defilement","Drug Lord Thaddius","Drug Lord Thaddius","Gutterside Informer","Gutterside Informer","Hired Killer","Hired Killer","Partner in Crime","Noxious Gas","Cartel Boss","Drug Den","Serial Killer"],
}

const deckNames = Object.keys(starterDecks);

function setDecks(decks: string[]) {
  localStorage.setItem("decks", JSON.stringify(decks));
}

export function getDecks() {
  if (localStorage.getItem("decks") == null) setDecks(deckNames);
  return JSON.parse(localStorage.getItem("decks")) as string[];
}

export function setDeck(name: string, deck: string[]) {
  if (!getDecks().includes(name)) setDecks([...getDecks(), name]);
  localStorage.setItem(`decks/${name}`, JSON.stringify(deck));
}

export function getDeck(name: string) {
  if (!getDecks().includes(name)) setDeck(name, []);
  if (localStorage.getItem(`decks/${name}`) == null) setDeck(name, starterDecks[name] ?? []);
  return JSON.parse(localStorage.getItem(`decks/${name}`)) as string[];
}