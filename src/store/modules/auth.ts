import * as types from '@/store/types';
import {Formio} from 'formiojs';
import { VuexModule, Module, Mutation, Action } from 'vuex-module-decorators'

@Module({ namespaced: true, name: 'auth' })

class Auth extends VuexModule {
  public user: {},
  public loggedIn: string = ''
  public roles: {},
  public forms: {},
  public userRoles: {},

  @Action
  setUser({ state, commit, dispatch }, user) {
    commit(types.SET_USER, user);
    dispatch('setLoggedIn', true);
    dispatch('setUserRoles', state.roles);
  },
  @Action
  setLoggedIn({commit}, loggedIn) {
    commit(types.SET_LOGGED_IN, loggedIn);
  },
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
  },
  @Action
  setUserRoles({ commit, getters }, roles) {
    const roleEntries = Object.entries(roles);
    const userRoles = getters.getUser.roles;
    const newRolesObj = {};
    roleEntries.forEach((role) => {
      const roleData = role[1];
      const key = 'is' + role[1].title.replace(/\s/g, '');
      newRolesObj[key] = !!userRoles.some(ur => roleData._id === ur);
    });
    commit(types.SET_USER_ROLES, newRolesObj);
  },

  @Mutation
  [types.SET_USER](state, user) {
    state.user = user;
  },
  @Mutation
  [types.SET_LOGGED_IN](state, loggedIn) {
    state.loggedIn = loggedIn;
  },
  @Mutation
  [types.SET_ROLES](state, roles) {
    state.roles = roles;
  },
  @Mutation
  [types.SET_FORMS](state, forms) {
    state.forms = forms;
  },
  @Mutation
  [types.SET_USER_ROLES](state, userRoles) {
    state.userRoles = userRoles;
  }
}

export default Auth;
