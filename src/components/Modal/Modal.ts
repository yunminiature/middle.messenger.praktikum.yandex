import Handlebars from 'handlebars';
import Block from '../../core/Block';
import { Button } from '../Button';
import rawTemplate from './Modal.hbs?raw';
import './Modal.scss';

export interface ModalProps {
  title?: string;
  content: string;
  buttonText?: string;
  errorText?: string;
  onAction?: () => void;
}

export default class Modal extends Block<ModalProps> {
  constructor(props: ModalProps) {
    super('div', props);
  }

  protected componentDidMount(): void {
    this.attachEvents();
  }

  protected componentDidUpdate(): boolean {
    this.attachEvents();
    return true;
  }

  private attachEvents() {
    const root = this.getContent();
    root.onclick = (e) => {
      const overlay = root.querySelector('[data-id="modal-overlay"]');
      if (overlay && e.target === overlay) {
        this.hide();
      }
    };
    const actionBtn = root.querySelector('[data-id="modal-action"]');
    if (actionBtn && this.props.onAction) {
      (actionBtn as HTMLElement).onclick = () => {
        this.props.onAction?.();
      };
    }
  }

  public show() {
    if (!document.body.contains(this.getContent())) {
      document.body.appendChild(this.getContent());
    }
  }

  public hide() {
    const el = this.getContent();
    if (el.parentElement) {
      el.parentElement.removeChild(el);
    }
  }

  protected compile(): string {
    let buttonHtml = '';
    if (this.props.buttonText) {
      const btn = new Button({
        text: this.props.buttonText,
        view: 'accent',
        fullWidth: true,
        className: 'modal-button',
        events: {},
      });
      btn.getContent().setAttribute('data-id', 'modal-action');
      buttonHtml = btn.getContent().outerHTML;
      console.log('[Modal] buttonHtml:', buttonHtml);
    }
    const context = {
      title: this.props.title,
      content: this.props.content,
      buttonText: this.props.buttonText,
      errorText: this.props.errorText,
      buttonHtml,
    };
    const result = Handlebars.compile(rawTemplate)(context);
    console.log('[Modal] compiled HTML:', result);
    return result;
  }
}
