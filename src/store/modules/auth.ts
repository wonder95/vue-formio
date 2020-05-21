import * as types from '@/store/types';
import {Formio} from 'formiojs';
import { VuexModule, Module, Mutation, Action } from 'vuex-module-decorators'

interface RoleItem {
  _id: string;
  title: String;
  admin: Boolean;
  default: Boolean;
}

interface RoleList {
  [key: string]: RoleItem;
}

@Module({  name: 'auth', namespaced: true })
export class Auth extends VuexModule {
  public user: {}
  public loggedIn: boolean
  public roles: {}
  public forms: {}
  public userRoles: {}

  @Action
  setUser({ state, commit, dispatch }, user) {
    commit(types.SET_USER, user);
    dispatch('setLoggedIn', true);
    dispatch('setUserRoles', state.roles);
  }
  @Action
  setLoggedIn({commit}, loggedIn) {
    commit(types.SET_LOGGED_IN, loggedIn);
  }
  @Action
  getAccess({ commit, dispatch, getters }) {
    const projectUrl = Formio.getProjectUrl();
    Formio.request(projectUrl + '/access')
      .then(function(accessItems) {
        commit(types.SET_ROLES, accessItems.roles);
        commit(types.SET_FORMS, accessItems.forms);
        if (getters.getLoggedIn) {
          dispatch('setUserRoles', accessItems.roles);
        }
    });
  }
  @Action
  setUserRoles({ commit, getters }, roles: RoleList) {
    const roleEntries = Object.entries(roles);
    const userRoles = getters.getUser.roles;
    const newRolesObj = {};
    roleEntries.forEach((role) => {
      const roleData = role[1];
      const key = 'is' + role[1].title.replace(/\s/g, '');
      newRolesObj[key] = !!userRoles.some(ur => roleData._id === ur);
    });
    commit(types.SET_USER_ROLES, newRolesObj);
  }

  @Mutation
  public [types.SET_USER](user) {
    this.user = user;
  }
  @Mutation
  public [types.SET_LOGGED_IN](loggedIn: boolean) {
    this.loggedIn = loggedIn;
  }
  @Mutation
  public [types.SET_ROLES](roles: RoleList) {
    this.roles = roles;
  }
  @Mutation
  public [types.SET_FORMS](forms) {
    this.forms = forms;
  }
  @Mutation
  public [types.SET_USER_ROLES](userRoles) {
    this.userRoles = userRoles;
  }
}

export default Auth;
