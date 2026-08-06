import { Component, inject, output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { Alert } from '../../../shared/components/widgets/alert/alert';
import { Button } from '../../../shared/components/widgets/button/button';
import { ICart, ICartAddOrUpdate } from '../../../shared/interface/cart.interface';
import { AuthService } from '../../../shared/services/auth.service';
import { LoginAction } from '../../../shared/store/action/auth.action';
import { GetCartItemsAction, SyncCartAction } from '../../../shared/store/action/cart.action';
import { CartState } from '../../../shared/store/state/cart.state';

@Component({
  selector: 'app-login',
  imports: [RouterModule, FormsModule, ReactiveFormsModule, TranslateModule, Alert, Button],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private store = inject(Store);
  private authService = inject(AuthService);
  formBuilder = inject(FormBuilder);
  private modalService = inject(NgbModal);

  cartItem$: Observable<ICart[]> = inject(Store).select(CartState.cartItems) as Observable<ICart[]>;

  readonly activeForm = output<string>();

  public validate: boolean = false;
  public loginForm: FormGroup;

  constructor() {
    this.loginForm = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
    });
  }

  submit() {
    this.validate = true;
    if (this.loginForm.valid) {
      this.store.dispatch(new LoginAction(this.loginForm.value)).subscribe({
        complete: () => {
          this.modalService.dismissAll();
          // Sync Cart Storage when successfully Login
          let syncCartItems: ICartAddOrUpdate[] = [];
          this.cartItem$.subscribe(items => {
            items.filter(item => {
              if (item) {
                const params: ICartAddOrUpdate = {
                  id: null,
                  product: item?.product,
                  product_id: item?.product_id,
                  variation: item?.variation ? item.variation : null,
                  variation_id: item?.variation_id ? item.variation_id : null,
                  quantity: item.quantity,
                };
                syncCartItems.push(params);
              }
            });
          });
          if (syncCartItems.length) {
            this.store.dispatch(new SyncCartAction(syncCartItems));
          } else {
            this.store.dispatch(new GetCartItemsAction());
          }

          this.authService.redirectUrl = undefined;
        },
      });
    }
  }

  action(action: string) {
    this.activeForm.emit(action);
  }
}
