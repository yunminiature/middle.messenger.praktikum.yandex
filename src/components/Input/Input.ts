import Block from '../../core/Block';
import Handlebars from 'handlebars';
import rawTemplate from './Input.hbs?raw';
import './Input.scss';
import { validateField } from '../../utils/validate';

export interface InputProps {
  name: string;
  type: string;
  placeholder?: string;
  label?: string;
  labelPlacement?: 'top' | 'left';
  required?: boolean;
  value?: string;
  errorText?: string;
  disabled?: boolean;
}

export default class Input extends Block<InputProps> {
  private localValue: string;

  private localError: string = '';

  constructor(props: InputProps) {
    super('div', props);
    this.localValue = props.value ?? '';
  }

  protected componentDidMount(): void {
    this.attachBlurHandler();
  }

  protected componentDidUpdate(): boolean {
    this.localValue = this.props.value ?? '';
    this.attachBlurHandler();
    return true;
  }

  private attachBlurHandler() {
    const input = this.getInputElement();
    if (!input) return;

    input.onblur = (e: FocusEvent) => {
      const target = e.target as HTMLInputElement;
      this.localValue = target.value;
      this.localError = validateField(target.name, this.localValue) ?? '';

      this.getContent().innerHTML = this.compile();
      this.attachBlurHandler();
    };
  }

  public getName(): string {
    return this.props.name;
  }

  public getValue(): string {
    return this.getInputElement()?.value ?? '';
  }

  public validate(): boolean {
    const input = this.getInputElement();
    if (!input) return true;

    const value = input.value;
    const name = input.name;
    const error = validateField(name, value);

    this.localValue = value;
    this.localError = error ?? '';

    this.getContent().innerHTML = this.compile();
    this.attachBlurHandler();

    return !error;
  }

  private getInputElement(): HTMLInputElement | null {
    return this.getContent().querySelector('input');
  }

  protected compile(): string {
    const value = this.localValue ?? this.props.value ?? '';
    return Handlebars.compile(rawTemplate)({
      ...this.props,
      value,
      errorText: this.localError,
    });
  }
}
