import Handlebars from 'handlebars';
import Block from '../../core/Block';
import { Input } from '../Input';
import type { InputProps } from '../Input';
import { Button } from '../Button';
import type { ButtonProps } from '../Button';
import rawTemplate from './Form.hbs?raw';
import './Form.scss';

export interface FormProps {
  title?: string;
  gap?: 'wide' | 'dence';
  inputs: InputProps[];
  mainButton?: ButtonProps;
  secondaryButton?: ButtonProps;
  onSubmit?: (values: Record<string, string>) => void;
  inputsStubId?: string;
  buttonsStubId?: string;
  _inputs?: Input[];
}

export default class Form extends Block<FormProps> {
  private mainButtonInstance?: Button;

  private secondaryButtonInstance?: Button;

  constructor(props: FormProps) {
    const inputsStubId = `form-inputs-${Math.random().toString(36).substring(2, 9)}`;
    const buttonsStubId = `form-buttons-${Math.random().toString(36).substring(2, 9)}`;

    super('div', {
      ...props,
      inputsStubId,
      buttonsStubId,
    });
  }

  protected init(): void {
    const inputInstances = this.props.inputs.map((props) => new Input(props));
    this.setProps({ _inputs: inputInstances });

    if (this.props.mainButton) {
      this.mainButtonInstance = new Button(this.props.mainButton);
    }

    if (this.props.secondaryButton) {
      this.secondaryButtonInstance = new Button(this.props.secondaryButton);
    }
  }

  protected componentDidMount(): void {
    this.renderChildrenIntoStubs();

    this.getContent().addEventListener('submit', (e) => {
      e.preventDefault();

      const inputInstances = this.props._inputs ?? [];

      const values: Record<string, string> = {};
      let isValid = true;

      inputInstances.forEach((input) => {
        const name = input.getName();
        const value = input.getValue();
        const valid = input.validate();

        if (!valid) {
          isValid = false;
        }

        values[name] = value;
      });

      if (isValid) {
        this.props.onSubmit?.(values);
      }
    });
  }

  protected componentDidUpdate(): boolean {
    this.renderChildrenIntoStubs();
    return true;
  }

  private renderChildrenIntoStubs() {
    const inputsContainer = this.getContent().querySelector(`[data-id="${this.props.inputsStubId}"]`);
    if (inputsContainer && this.props._inputs) {
      inputsContainer.innerHTML = '';
      this.props._inputs.forEach((input) => {
        inputsContainer.appendChild(input.getContent());
      });
    }

    const buttonsContainer = this.getContent().querySelector(`[data-id="${this.props.buttonsStubId}"]`);
    if (buttonsContainer) {
      buttonsContainer.innerHTML = '';
      if (this.mainButtonInstance) {
        buttonsContainer.appendChild(this.mainButtonInstance.getContent());
      }
      if (this.secondaryButtonInstance) {
        buttonsContainer.appendChild(this.secondaryButtonInstance.getContent());
      }
    }
  }

  protected compile(): string {
    return Handlebars.compile(rawTemplate)(this.props);
  }
}
