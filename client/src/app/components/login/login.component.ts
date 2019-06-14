import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public title:string;
  public user: User;
  public status: string;
  public identity;
  public token;

  constructor(
      private _route: ActivatedRoute,
      private _router: Router,
      private _userService: UserService
    ) {
    this.title = 'Identificate';
    this.user = new User("", "", "", "", "", "", "ROLE_USER", "");
  }

  ngOnInit() {
    console.log('Login cargando');
  }

  onSubmit(form){
    //loguear usuario
    this._userService.signup(this.user).subscribe(
      response => {
        this.identity = response.user;
        if(!this.identity && !this.identity._id){
          this.status = 'error';
        }else{
          this.status = 'success';
          //PERSISTIR DATOS DEL USUARIO
          localStorage.setItem('identity', JSON.stringify(this.identity));

          //Conseguir el token
          this.getToken();
        }
      },
      error => {
        var errorMessage = <any>error;
        console.log(errorMessage);
        if(errorMessage != null){
          this.status = 'error';
        }
      }
    );
  }

  getToken(){
    //loguear usuario
    this._userService.signup(this.user, 'true').subscribe(
      response => {
        this.token = response.token;
        if(this.token.length <= 0){
          this.status = 'error';
        }else{
          this.status = 'success';
          //PERSISTIR TOKEN DEL USUARIO
          localStorage.setItem('token', this.token);
          //Conseguir los contadores o estadísticas del usuario
        }
      },
      error => {
        var errorMessage = <any>error;
        console.log(errorMessage);
        if(errorMessage != null){
          this.status = 'error';
        }
      }
    );
  }

}
