import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import LockIcon from '@material-ui/icons/LockOutlined';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import AdminIndex from './AdminIndex';

const styles = theme => ({
  layout: {
    width: 'auto',
    display: 'block', // Fix IE11 issue.
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
      width: 400,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    marginTop: theme.spacing.unit * 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
  },
  avatar: {
    margin: theme.spacing.unit,
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE11 issue.
    marginTop: theme.spacing.unit,
  },
  submit: {
    marginTop: theme.spacing.unit * 3,
	},
	loginWarning: {
		color: 'red',
		marginTop: 10,
		fontWeight: 'bold'
	}
});

class SignIn extends Component {
	constructor(props) {
    super(props);
    this.state = {
			invalidLogin: null,
			usuario: '',
			senha: '',
			logado: true
		};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
	}
	
	handleChange(event) {
		const target = event.target;
		const name = target.name;
		const value = target.value;
		
		this.setState({
			[name]: value
		});
	}
	
	handleSubmit(event) {
		axios.post(`http://localhost:5000/api/login/user`, {
			usuario: this.state.usuario,
			senha: this.state.senha
		})
		.then(res => {
			if(res.data === '{Status: success}') { // Alterar
				this.setState({'logado': true});
			}
			else
				this.setState({invalidLogin: 'Usuário ou senha inválidos!'});
	
		})
		.catch(error =>{
				console.log(error)
		})
    event.preventDefault();
	}
	
	render () {
		const { classes } = this.props;
		if(this.state.logado) {
			return <AdminIndex logado={this.state.logado} />
		}
		return (
			<React.Fragment>
				<CssBaseline />
				<main className={classes.layout}>
					<Paper className={classes.paper}>
						<Avatar className={classes.avatar}>
							<LockIcon />
						</Avatar>
						<Typography contained="headline">Entrar no sistema</Typography>
						<Typography className={classes.loginWarning} contained="headline">{this.state.invalidLogin}</Typography>
						<form className={classes.form} onSubmit={this.handleSubmit}>
							<FormControl margin="normal" required fullWidth>
								<InputLabel htmlFor="usuario">Usuário</InputLabel>
								<Input
									name="usuario"
									autoFocus
									value={this.state.value}
									onChange={this.handleChange}
								/>
							</FormControl>
							<FormControl margin="normal" required fullWidth>
								<InputLabel htmlFor="senha">Senha</InputLabel>
								<Input
									name="senha"
									type="password"
									id="senha"
									value={this.state.value}
									onChange={this.handleChange}
								/>
							</FormControl>
							<Button
								type="submit"
								fullWidth
								contained="raised"
								color="primary"
								className={classes.submit}
							>
								Entrar
							</Button>
						</form>
					</Paper>
				</main>
			</React.Fragment>
		);
	}
}

SignIn.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SignIn);