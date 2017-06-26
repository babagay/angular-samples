import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import {MdIconModule, MdButtonModule, MdCheckboxModule,
    MdCardModule, MdMenuModule, MdToolbarModule  } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { trigger, state, style, transition, animate } from '@angular/animations';




// import {MdIconModule, MdButtonModule, MdCheckboxModule} from './../../node_modules/@angular/material';

import {
  NgModule,
  ApplicationRef
} from '@angular/core';
import {
  removeNgStyles,
  createNewHosts,
  createInputTransfer
} from '@angularclass/hmr';
import {
  RouterModule,
  PreloadAllModules
} from '@angular/router';

/*
 * Platform and Environment providers/directives/pipes
 */
import { ENV_PROVIDERS } from './environment';
import { ROUTES } from './app.routes';

// App is our top level component
import { AppComponent } from './app.component';
import { APP_RESOLVER_PROVIDERS } from './app.resolver';
import { AppState, InternalStateType } from './app.service';
import { HomeComponent } from './home';
import { AboutComponent } from './about';
import { NoContentComponent } from './no-content';
import { XLargeDirective } from './home/x-large';


import '../styles/styles.scss';
import '../styles/headings.css';

// Импортируем директивы: здесь и в массиве  declarations
import {TodoFormComponent} from "./todos/todo-form/todo-form.component";
import {TodoListComponent} from "./todos/todo-list/todo-list.component";
import {TodoItemComponent} from "./todos/todo-item/todo-item.component";
import {TodoComponent} from "./todos/todo.component";
import {InMemoryBackendService, InMemoryDbService, InMemoryWebApiModule} from "angular-in-memory-web-api";
import {MessageService} from "./shared/message.service";
import {TodoService} from "./shared/todo.service";


// Application wide providers
const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  AppState
];

type StoreType = {
  state: InternalStateType,
  restoreInputValues: () => void,
  disposeOldHosts: () => void
};

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [ AppComponent ],
  declarations: [
    AppComponent,
      TodoFormComponent,
      TodoListComponent,
      TodoItemComponent,
      TodoComponent,
    AboutComponent,
    HomeComponent,
    NoContentComponent,
    XLargeDirective
  ],
  /**
   * Import Angular's modules.
   */
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(ROUTES, { useHash: true, preloadingStrategy: PreloadAllModules }),
    MdIconModule,
      MdButtonModule,
      MdCheckboxModule,
    BrowserAnimationsModule,
    MdMenuModule,
    MdCardModule,
    MdToolbarModule,
      // InMemoryBackendService,
      //InMemoryWebApiModule
  ],
  /**
   * Expose our Services and Providers into Angular's dependency injection.
   * Здесь регистрируем сервисы
   */
  providers: [
    ENV_PROVIDERS,
    APP_PROVIDERS,
    TodoService,
      MessageService
  ]
})
export class AppModule {

  constructor(
    public appRef: ApplicationRef,
    public appState: AppState
  ) {}

  public hmrOnInit(store: StoreType) {
    if (!store || !store.state) {
      return;
    }
    console.log('HMR store', JSON.stringify(store, null, 2));
    /**
     * Set state
     */
    this.appState._state = store.state;
    /**
     * Set input values
     */
    if ('restoreInputValues' in store) {
      let restoreInputValues = store.restoreInputValues;
      setTimeout(restoreInputValues);
    }

    this.appRef.tick();
    delete store.state;
    delete store.restoreInputValues;
  }

  public hmrOnDestroy(store: StoreType) {
    const cmpLocation = this.appRef.components.map((cmp) => cmp.location.nativeElement);
    /**
     * Save state
     */
    const state = this.appState._state;
    store.state = state;
    /**
     * Recreate root elements
     */
    store.disposeOldHosts = createNewHosts(cmpLocation);
    /**
     * Save input values
     */
    store.restoreInputValues  = createInputTransfer();
    /**
     * Remove styles
     */
    removeNgStyles();
  }

  public hmrAfterDestroy(store: StoreType) {
    /**
     * Display new elements
     */
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }

}
