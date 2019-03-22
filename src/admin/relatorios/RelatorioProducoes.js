import React, { Component } from 'react'
import { Layout, Icon, Button, Row, Col, notification } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"

const { Content } = Layout


class RelatorioProducoes extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Relatório - Produções')
    }

    state = {
        reportUrl: null,
        buttonLoading: false
    }

    generateReport = () => {
        this.setState({buttonLoading: true})
        console.log('generateReport')
        axios
        .get(this.props.backEndPoint + '/reportProducoes')
        .then(res => {
            if(res.data.success){
                this.setState({reportUrl: res.data.payload.url, buttonLoading: false})
                this.showNotification(res.data.msg, true)
            }
        })
        .catch(error => {
            console.log(error)
            this.setState({buttonLoading: false})
        })
    }

    resetButton = () => {
        this.setState({reportUrl: null})
    }

    showNotification = (msg, success) => {
        var type = null
        var style = null
        if(success){
            type = 'check-circle'
            style = {color: '#4ac955', fontWeight: '800'}
        }
        else {
            type = 'exclamation-circle'
            style = {color: '#f5222d', fontWeight: '800'}
        }
        const args = {
            message: msg,
            icon:  <Icon type={type} style={style} />,
            duration: 1
        }
        notification.open(args)
    }

    render(){
        const buttonReport = this.state.reportUrl === null ?
            <Button className="buttonGreen" onClick={this.generateReport} loading={this.state.buttonLoading}><Icon type="bar-chart" /> Gerar Relatório</Button>
            :
            <a href={this.state.reportUrl}><Button className="buttonOrange" onClick={this.resetButton}><Icon type="download" /> Baixar Relatório</Button></a>
        return(
            <Content
                style={{
                    margin: "24px 16px",
                    padding: 24,
                    background: "#fff",
                    minHeight: 280
                }}
            >

                <Row style={{ marginBottom: 16 }}>
                    <Col span={24} align="middle">
                        {buttonReport}
                    </Col>
                </Row>
          </Content>
        )
    }
}

const MapStateToProps = (state) => {
	return {
        backEndPoint: state.backEndPoint
	}
}

const mapDispatchToProps = (dispatch) => {
    return {
        setPageTitle: (pageTitle) => { dispatch({ type: 'SET_PAGETITLE', pageTitle }) }
    }
}

export default connect(MapStateToProps, mapDispatchToProps)(RelatorioProducoes)