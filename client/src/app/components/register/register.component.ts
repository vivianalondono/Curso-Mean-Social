import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers: [UserService]
})
export class RegisterComponent implements OnInit {
  public title:string;
  public user: User;
  public status: string;

  constructor(private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService) {
    this.title = 'Registrate';
    this.user = new User("", "", "", "", "", "", "ROLE_USER", "");
   }

  ngOnInit() {
    console.log('Register cargando');
  }

  onSubmit(form){
    this._userService.register(this.user).subscribe(
      response => {
        if(response.user && response.user._id){
          //console.log(response.user);
          this.status = 'success';
          form.reset();
        }else{
          this.status = 'error';
        }
      },
      error => {
        console.log(<any>error);
      }
    );
  }

}
