import Handlebars from 'handlebars';
import Block from '../../core/Block';
import { Button } from '../Button';
import type { ButtonProps } from '../Button';
import rawTemplate from './Dropdown.hbs?raw';
import './Dropdown.scss';

export interface DropdownProps {
  trigger: ButtonProps;
  items: ButtonProps[];
  triggerStubId?: string;
  contentStubId?: string;
  _triggerInstance?: Button;
  _itemInstances?: Button[];
}

export default class Dropdown extends Block<DropdownProps> {
  constructor(props: DropdownProps) {
    const triggerStubId  = `dropdown-trigger-${Math.random().toString(36).substr(2, 9)}`;
    const contentStubId  = `dropdown-content-${Math.random().toString(36).substr(2, 9)}`;
    super('div', { ...props, triggerStubId, contentStubId });
  }

  protected init(): void {
    // создаём кнопку-триггер
    this.props._triggerInstance = new Button(this.props.trigger);
    // создаём кнопки-пункты меню
    this.props._itemInstances = this.props.items.map(item => new Button(item));
  }

  protected componentDidMount(): void {
    this.renderChildrenIntoStubs();

    const triggerEl = this.getContent().querySelector(`[data-id="${this.props.triggerStubId}"] button`);
    const contentEl = this.getContent().querySelector(`[data-id="${this.props.contentStubId}"]`);

    if (triggerEl && contentEl) {
      triggerEl.addEventListener('click', () => {
        contentEl.classList.toggle('dropdown-content--visible');
      });
    }
  }

  protected componentDidUpdate(): boolean {
    this.renderChildrenIntoStubs();
    return true;
  }

  private renderChildrenIntoStubs() {
    // триггер
    const triggerContainer = this.getContent().querySelector(`[data-id="${this.props.triggerStubId}"]`);
    if (triggerContainer && this.props._triggerInstance) {
      triggerContainer.innerHTML = '';
      triggerContainer.appendChild(this.props._triggerInstance.getContent());
    }

    // список кнопок
    const contentContainer = this.getContent().querySelector(`[data-id="${this.props.contentStubId}"]`);
    if (contentContainer && this.props._itemInstances) {
      contentContainer.innerHTML = '';
      this.props._itemInstances.forEach(btn => {
        contentContainer.appendChild(btn.getContent());
      });
    }
  }

  protected compile(): string {
    return Handlebars.compile(rawTemplate)(this.props);
  }
}
