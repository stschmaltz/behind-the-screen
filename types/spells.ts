export interface Spell {
  _id: number;
  name: string;
  level: number;
  school: string;
  components: string[];
  material?: string;
  casting_time: string;
  concentration: boolean;
  duration: string;
  range: string;
  ritual: boolean;
  description: string;
  higher_levels?: string;
  classes: string[];
  book: string;
}
