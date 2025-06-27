import { Routes } from '@angular/router';
import { LoginComponent } from './auth/pages/login/login.component';
import { RegisterComponent } from './auth/pages/register/register.component';
import { VoterDashboardComponent } from './dashboards/voter-dashboard/voter-dashboard.component';
import { VoterHomeComponent } from './voter-dashboard/voter-home/voter-home.component';
import { ForgotPasswordComponent } from './auth/pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/pages/reset-password/reset-password.component';
import { ElectrolCommisionDashboardComponent } from './dashboards/electrol-commision-dashboard/electrol-commision-dashboard.component';
import { ElectrolCommisionHomeComponent } from './pages/electrol-commision-home/electrol-commision-home.component';
import { AdminDashboardComponent } from './dashboards/admin-dashboard/admin-dashboard.component';
import { AdminHomeComponent } from './pages/admin-home/admin-home.component';
import { DelegateApplicationComponent } from './voter-dashboard/applications/delegate-application/delegate-application.component';
import { CandidateApplicationComponent } from './voter-dashboard/applications/candidate-application/candidate-application.component';
import { ElectionsComponent } from './voter-dashboard/voting/elections/elections.component';
import { CandidatesComponent } from './voter-dashboard/voting/candidates/candidates.component';
import { PositionsComponent } from './voter-dashboard/voting/positions/positions.component';
import { CandidateResultsComponent } from './voter-dashboard/results/candidate-results/candidate-results.component';

export const routes: Routes = [

    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'forgot-password',
        component: ForgotPasswordComponent
    },
    {
        path: 'reset-password',
        component: ResetPasswordComponent
    },
    {
        path: 'voter',
        component: VoterDashboardComponent,
        children: [
            {
                path: '',
                component: VoterHomeComponent
            },
            { path: 'apply-delegate', component: DelegateApplicationComponent },
            { path: 'apply-candidate', component: CandidateApplicationComponent },
            { path: 'voting', component: ElectionsComponent },
            { path: 'voting/:electionId/positions', component: PositionsComponent },
            { path: 'voting/:electionId/positions/:positionId/candidates', component: CandidatesComponent },
            { path: 'results', component: CandidateResultsComponent }
        ]
    },
    {
        path: 'electrol-commision', component: ElectrolCommisionDashboardComponent,
        children: [
            {
                path: '', component: ElectrolCommisionHomeComponent
            }
        ]
    },
    {
        path: 'admin', component: AdminDashboardComponent,
        children: [
            {
                path: '', component: AdminHomeComponent,

            }
        ]
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];
